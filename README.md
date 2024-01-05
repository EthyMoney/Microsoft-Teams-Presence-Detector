<p align="left">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg/2203px-Microsoft_Office_Teams_%282018%E2%80%93present%29.svg.png" alt="Teams Logo" width="15%" height="auto">
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://static.wixstatic.com/media/d98092_967d2f1b524e423c8c5c5644ea740e8e~mv2.png/v1/fill/w_450,h_448,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/d98092_967d2f1b524e423c8c5c5644ea740e8e~mv2.png" alt="Available Icon" width="10%" height="auto">
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://static.wixstatic.com/media/d98092_b176baa20fcb427daec31fe967c0acf7~mv2.png/v1/fill/w_450,h_448,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/d98092_b176baa20fcb427daec31fe967c0acf7~mv2.png" alt="Away Icon" width="10%" height="auto">
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://static.wixstatic.com/media/d98092_fbff9ee78d3d401891dde6cfd598e7f5~mv2.png/v1/fill/w_450,h_448,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/d98092_fbff9ee78d3d401891dde6cfd598e7f5~mv2.png" alt="Available Icon" width="10%" height="auto">
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</p>

# Microsoft Teams Presence Detector

This is a Node.js application that monitors the Microsoft Teams log file for user presence state change events and provides triggers to act on changes. This allows detection of changes to your online status (e.g., when you go from Available to Away) which can be used to trigger other actions, such as turning on/off lights in your home office, sending notifications to other applications, changing a status light color at your desk, and much more! Personally, I use this at work to change the color of an RGB light on my desk to indicate my status and tell people if I'm available or not before they walk over to ask me something.

## **HEADS UP: This is currently NOT compatible with the "new" Teams. This only work with the old Teams due to the new one not writing presense states to a log file, which this program depends on.** This could change in the future where this log file method works again, but there's a good chance that this program will need to be reworked to work with the new Teams once it's being forced to use it. You can currently still opt to use the old one so this still works.

## How It Works

The application watches the Teams log file for changes and uses regular expressions to extract the current state from the log entries. It keeps track of the last known size of the file and reads the new content after each change. It compares the new state with the previous state to identify the latest presence state and alert when it has changed.

The best part? No cloud connection, API, or any authentication is needed thanks to the simplicity of just reading a log file stored on your local machine. Luckily, Microsoft writes presence changes to the log file, so we can do away with all the complicated Azure account and Graph API setup and authentication.

The app will detect what operating system you're on and your username so it can dynmaically update the file location path of the Teams log file before it loads it. If for some reason yours fails to load or your file is in a different place than expected (like some flavors of linux), you can manually set the file path in the code to where your file actually is. Just remove the part that checks the operating system and set it yourself.

## Prerequisites

- Node.js v18 or higher
- Microsoft Teams (desktop app only, not browser version)
- Running on Windows 10/11, MacOS (Apple Silicon too!), and most flavors of Linux

## Installation

1. Clone the repository:

      `git clone https://github.com/EthyMoney/Microsoft-Teams-Presence-Detector.git`

2. Navigate to the project directory:

      `cd Microsoft-Teams-Presence-Detector`

3. Open `main.js` and add your code for what you want to have happen when your presence changes. The current example code will print the current presence state and changes to the console, customize it to your needs.

4. Run it:

      `node main.js`   Note: The step to install dependencies was left out purposefully because this doesn't require any more than just Node.js itself!

That's it! You can now use this to trigger other actions based on your presence status.

## Example Output (from the current example code in main.js that just prints to the console)

```
hello, <User>!
Running on Windows
log file loaded, current lines count: 19631
Latest state change on startup: Available  
watching file for changes...
Latest state change detected: Busy
Latest state change detected: Available
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

If you have any suggestions or improvements, please open an issue, or pull request. I'm always looking for ways to improve and would love to hear your feedback!
