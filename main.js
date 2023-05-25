const fs = require('fs');
const os = require('os');

// get the username of the current user
const username = os.userInfo().username;
console.log('hello, ' + username + '!');

let filePath = "";
let lastKnownSize = 0;
let latestStateChange = null;
let prevState = null;

// Get the current operating system
const platform = os.platform();

if (platform === 'win32') {
  console.log('Running on Windows');
  filePath = `C:/Users/${username}/AppData/Roaming/Microsoft/Teams/logs.txt`;
} else if (platform === 'darwin') {
  console.log('Running on macOS');
  filePath = `/Users/${username}/Library/Application Support/Microsoft/Teams/logs.txt`;
} else if (platform === 'linux') {
  console.log('Running on Linux');
  filePath = `/home/${username}/.config/Microsoft/Microsoft Teams/logs.txt`;
} else {
  console.log(`Unknown platform: ${platform}. You will need to manually specify the path to the log file within the script code.`);
  process.exit(1);
}

// Function to extract the new state from the log line
function extractNewState(line) {
  const regex = /current state: (\w+)\s->\s(\w+)/;
  const match = line.match(regex);
  if (match) {
    return match[2]; // Extract the new state from the second capture group
  }
  return null; // Return null if the line does not match the expected pattern
}

//* Startup *//

// Read the initial content of the file
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error(`Error reading file: ${err}`);
    return;
  }

  const lines = data.split('\n');

  console.log('log file loaded, current lines count: ' + lines.length)

  lines.forEach(line => {
    if (line.includes('current state')) {
      const newState = extractNewState(line);
      if (newState) {
        latestStateChange = newState;
      }
    }
  });

  if (latestStateChange) {
    console.log(`Latest state change on startup: ${latestStateChange}`);
    prevState = latestStateChange;
    // Do something with the latest state change here
  }

  console.log('watching file for changes...')

  // Watch the file for changes
  fs.watchFile(filePath, (curr, prev) => {
    // Check if the file was modified
    if (curr.mtime > prev.mtime) {
      // Read the updated content since the last known size
      fs.open(filePath, 'r', (err, fd) => {
        if (err) {
          console.error(`Error opening file: ${err}`);
          return;
        }

        fs.fstat(fd, (err, stats) => {
          if (err) {
            console.error(`Error getting file stats: ${err}`);
            fs.close(fd, () => { }); // Close the file descriptor
            return;
          }

          const fileSize = stats.size;
          const bufferSize = fileSize - lastKnownSize;

          if (bufferSize > 0) {
            const buffer = Buffer.alloc(bufferSize);

            fs.read(fd, buffer, 0, bufferSize, lastKnownSize, (err, bytesRead, buffer) => {
              if (err) {
                console.error(`Error reading file: ${err}`);
              } else {
                const newContent = buffer.toString('utf8');
                const lines = newContent.split('\n');

                lines.forEach(line => {
                  if (line.includes('current state')) {
                    const newState = extractNewState(line);
                    if (newState) {
                      latestStateChange = newState;
                    }
                  }
                });

                if (latestStateChange && latestStateChange !== prevState) {
                  console.log(`Latest state change detected: ${latestStateChange}`);
                  prevState = latestStateChange;
                  // Do something with the latest state change here
                }
              }

              fs.close(fd, () => { }); // Close the file descriptor
            });
          } else {
            fs.close(fd, () => { }); // Close the file descriptor
          }

          lastKnownSize = fileSize; // Update the last known file size
        });
      });
    }
  });
});
