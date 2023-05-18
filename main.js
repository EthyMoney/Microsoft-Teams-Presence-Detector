const fs = require('fs');

// get the windows username of the current user so we can find the log file
//TODO: MacOS and Linux support
const username = process.env['USERNAME'];
console.log('hello, ' + username + '!');

const filePath = `C:/Users/${username}/AppData/Roaming/Microsoft/Teams/logs.txt`;

let lastKnownSize = 0;
let latestStateChange = null;
let prevState = null;

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
