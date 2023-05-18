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

This is a Node.js application that monitors the Microsoft Teams log file for user presence state change events and provides triggers to take action on changes. This allows detection of changes to your online status (e.g. when you go from Available to Away) which can be used to trigger other actions, such as turning on/off lights in your home office, sending notifications to other applications, changing a status light color at your desk, and much more! Personally, I use this at work to change the color of an RGB light on my desk to indicate my current status and tell people if I'm available or not before they walk over to ask me something.

## How It Works

The application watches the Teams log file for changes and uses regular expressions to extract the current state from the log entries. It keeps track of the last known size of the file and reads the new content after each change. It compares the new state with the previous state to identify the latest presence state and alert when it has changed.

## Prerequisites

- Node.js v18 or higher
- Microsoft Teams (desktop app only, not browser version)
- Running Teams on Windows 10/11 OS (MacOS and Linux support coming!)

## Installation

1. Clone the repository:

      `git clone https://github.com/EthyMoney/Microsoft-Teams-Presence-Detector.git`

2. Navigate to the project directory:

      `cd Microsoft-Teams-Presence-Detector`

3. Open `main.js` and add what you want to have happen when your presence changes. The current example code will print the current presence state and changes to the console, customize it to your needs.

4. Run it:

      `node main.js`

That's it! You can now use this to trigger other actions based on your presence state.

## Example Output (with example code in main.js that just prints to the console)

```
Latest state change on startup: Available
Latest state change detected: Away
Latest state change detected: Available
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Contributing

If you have any suggestions or improvements, please open an issue or pull request. I'm always looking for ways to improve and would love to hear your feedback!
