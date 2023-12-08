const fs = require('fs');
const os = require('os');
const axios = require('axios'); // Import axios library
const config = require('./config.json'); // Import config file

// Set the IP address and port of the lighting control API
const lightingApiUrl = config.lightingControllerApiUrl;

// get the username of the current user
const username = os.userInfo().username;
console.log('Hello, ' + username + '!');

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

// Define a mapping of states to lighting actions
const stateToLightingAction = {
  available: { endpoint: '/set_color', color: [0, 255, 0], message: 'green' },
  busy: { endpoint: '/set_color', color: [255, 0, 0], message: 'red' },
  donotdisturb: { endpoint: '/set_color', color: [128, 0, 128], message: 'purple (Do Not Disturb)' },
  onthephone: { endpoint: '/alternating_colors', colors: { color1: [255, 0, 0], color2: [0, 0, 0] }, message: 'red and off during a call' },
  inameeting: { endpoint: '/alternating_colors', colors: { color1: [255, 0, 0], color2: [0, 0, 0] }, message: 'red and off during a call' },
  away: { endpoint: '/set_color', color: [255, 155, 0], message: 'yellow' },
  berightback: { endpoint: '/set_color', color: [255, 105, 0], message: 'orange' },
  offline: { endpoint: '/pulse_effect', color: [255, 255, 255], message: 'off' },
  newactivity: { endpoint: '/alternating_colors', colors: { color1: [0, 0, 255], color2: [0, 0, 0] }, message: 'blue and off for new activity' }
};

// Function to make API calls to control the lighting
function controlLighting(newState) {
  newState = newState.toLowerCase();
  const lightingAction = stateToLightingAction[newState];

  if (lightingAction) {
    const { endpoint, color, colors, message } = lightingAction;

    axios.post(`${lightingApiUrl}${endpoint}`, colors ? colors : { color })
      .then(response => {
        console.log(`Lighting set to ${message}:`, response.data.message);
      })
      .catch(error => {
        console.error('Error setting lighting:', error.message);
      });
  } else {
    console.log(`Unknown state: ${newState}`);
  }
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

  console.log('Log file loaded, current lines count: ' + lines.length)

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
    controlLighting(latestStateChange); // Call the controlLighting function
  }

  console.log('Watching file for changes...\n')

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

                // When a new state is detected, call the controlLighting function
                if (latestStateChange && latestStateChange !== prevState) {
                  console.log(`Latest state change detected: ${latestStateChange}`);
                  prevState = latestStateChange;
                  controlLighting(latestStateChange); // Call the controlLighting function
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
