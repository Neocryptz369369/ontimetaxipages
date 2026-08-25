# On Time Taxi - iPhone App Folder

This folder turns the On Time Taxi website into a real iPhone app that can be
put on the Apple App Store. The app is a native iPhone shell that loads
https://ontimetaxi.biz inside it, plus real iPhone features: GPS location,
push notification alarms, and camera/photo uploads.

You only need to do this once. After that, every change made to the website
shows up in the app automatically with no new App Store submission.

## Key numbers to keep handy

- App name: On Time Taxi
- Bundle ID: biz.ontimetaxi.app
- Website the app loads: https://ontimetaxi.biz
- Support phone: 930-216-4166
- Support email: neocryptz@yahoo.com
- Privacy Policy URL: https://ontimetaxi.biz/privacy
- Terms of Service URL: https://ontimetaxi.biz/terms
- Support URL: https://ontimetaxi.biz/support
- Account deletion URL: https://ontimetaxi.biz/delete-account

## What you need first

1. A Mac computer (any Mac made in the last few years).
2. Xcode, free from the Mac App Store.
3. Node.js, free from https://nodejs.org (pick the big green LTS button).
4. Your paid Apple Developer account signed in inside Xcode.

## Step 1 - Get the files onto the Mac

Open the Terminal app on the Mac and paste these lines one at a time:

```
git clone https://github.com/Neocryptz369369/ontimetaxipages.git
cd ontimetaxipages/ios-app
```

## Step 2 - Build the iPhone project

Still in Terminal, paste:

```
npm install
npx cap add ios
npx cap sync ios
npx cap open ios
```

The last line opens Xcode with the app project ready.

## Step 3 - Settings inside Xcode

Click the blue "App" name at the top of the left-hand list, then:

1. Signing & Capabilities tab: tick "Automatically manage signing" and pick
   your Apple Developer team in the Team box.
2. Check the Bundle Identifier reads exactly: biz.ontimetaxi.app
3. Press the "+ Capability" button and add "Push Notifications".
4. Press "+ Capability" again and add "Background Modes", then tick
   "Remote notifications" and "Location updates".
5. General tab: set Version to 1.0 and Build to 1.
6. General tab: under Supported Destinations leave iPhone and iPad on.

## Step 4 - The permission messages Apple requires

In the left-hand list open ios > App > App > Info.plist, then add these
rows (press the small + button). Left column is the key, right column is the
wording the customer sees. Use this exact wording, it is written to match the
privacy policy already on the website.

- NSLocationWhenInUseUsageDescription
  On Time Taxi uses your location to set your pickup point, show your driver
  on the map, and calculate your fare.

- NSLocationAlwaysAndWhenInUseUsageDescription
  Drivers share their location while on a trip so riders and the dispatcher
  can see where the taxi is.

- NSCameraUsageDescription
  The camera is used to add your profile photo, upload driver documents, and
  record evidence if you press the emergency or accident button.

- NSMicrophoneUsageDescription
  The microphone is used for hands-free voice messages between rider and
  driver, and to record audio if you press the emergency button.

- NSPhotoLibraryUsageDescription
  Your photo library is used to pick a profile photo or attach accident
  photos.

- NSPhotoLibraryAddUsageDescription
  Saves receipts and accident photos back to your photo library.

- NSSpeechRecognitionUsageDescription
  Speech recognition lets drivers send chat messages by talking so they can
  keep their hands on the wheel.

## Step 5 - Try it on your own iPhone first

1. Plug the iPhone into the Mac with a cable.
2. At the top of Xcode pick your iPhone from the device list.
3. Press the triangular Play button.
4. The app installs on the phone. Open it and check: booking a ride, the
   "use my current location" button, the map, the alarm notification, and the
   Privacy / Terms / Support / Delete Account links at the bottom.

## Step 6 - Send it to Apple

1. In Xcode at the top pick "Any iOS Device (arm64)" instead of your phone.
2. Menu bar: Product > Archive. Wait for it to finish.
3. In the window that appears press "Distribute App", then "App Store
   Connect", then "Upload".
4. Go to https://appstoreconnect.apple.com, open the On Time Taxi app,
   attach the build, fill in the store listing, and press
   "Add for Review".

## Step 7 - Whenever the website changes

Nothing to do. The app loads the live website, so website updates appear in
the app right away. You only rebuild and re-upload if you change something in
this folder.

## If Apple pushes back

Apple sometimes rejects apps that are only a website in a box. This app is
not that: it uses native GPS, native push notification alarms, native camera
and microphone for the emergency recording, and it is a real transport
service in Clark County, Indiana. The wording to send them is in
APP-STORE-REVIEW-NOTES.md in this same folder.
