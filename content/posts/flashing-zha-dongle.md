+++
title = "Flashing SONOFF Zigbee 3.0 USB Dongle with new firmware"
date = "2024-01-22T22:30:00+01:00"
author = "Daniel Carl Jones"
cover = ""
tags = ["smart-home", "guide"]
keywords = ["smart", "home", "flash", "zigbee", "sonoff"]
description = ""
showFullContent = false
+++

I have one of the [SONOFF Zigbee 3.0 USB Dongle](https://sonoff.tech/product/gateway-and-sensors/sonoff-zigbee-3-0-usb-dongle-plus-p/).
It is attached to my home server and provides me with Zigbee connectivity for smart home integrations.
The problem is that occasionally I have two sensors that drop off the network, after which I need to pair them again to get them working again.
I'm hoping that flashing the latest firmware on to the Zigbee dongle may help.

I wanted to use an ARM-based Macbook to flash the new firmware.
I heavily relied on [Smart Home Addict's video](https://www.youtube.com/watch?v=fzoiT0mUdkg), adapting at each point to follow along on macOS.

I've written this post for future reference, and hopefully it may help someone out there too.

_Of course, I cannot be responsible and you follow this guide and others at your own risk._

For the rest of this process, I recommend changing into a directory that you won't accidentally lose.
For example, creating a directory on your desktop which you can delete later.

## Preparing packages and software

This section will download a bunch of drivers, Python packages, and firmware.

### Drivers

First, we needed a bunch of drivers that help the software on macOS interact with UART devices over USB.

The [Silicon Lab's USB to UART bridge device driver](https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers) is needed.
I preferred to pull it down using Homebrew.

```
$ brew install silicon-labs-vcp-driver
```

### Python packages and scripts

Two Python projects are used in this guide:
one to read the current firmware for a backup,
the other to write the new firmware.

~~At this point, I should probably be recommending to use a virtual environment - but I never did get around to figuring out how they worked so I skipped that bit.~~

I installed a bunch of pip packages as recommended in the video I was following:

```
$ pip3 install \
    wheel \
    pyserial \
    intelhex \
    python-magic \
    zigpy-znp
```

After that, I downloaded a copy of this software: https://github.com/JelmerT/cc2538-bsl.

Since I'm used to Git, I just performed a Git clone but downloading the zip and deexpanding the archive would work too.

```
$ git clone git@github.com:JelmerT/cc2538-bsl.git
```

### New firmware

The last thing to download is the new firmware you wish to flash.
There's a bunch of firmware available in this repository.

https://github.com/Koenkk/Z-Stack-firmware/tree/master/coordinator/Z-Stack_3.x.0/bin

The video and the documentation both recommend "Coordinator firmware" (which sounds about right).
The file should look something like this: "CC1352P2_CC2652P_launchpad_*.zip".
Download and unzip this into your working directory.

At this point, all the software should be installed and/or prepared.

## Identifying the Sonoff device

Before attaching the dongle, run the following command and observe which entries are present.
For example, I see two entries.

```
$ ls -a1 /dev/tty.*
/dev/tty.Bluetooth-Incoming-Port
/dev/tty.DannysHeadphones
```

It's time to plug-in the Sonoff USB dongle.
Then run the command again - you should see a new device.
That should be the Sonoff device.

```
$ ls -a1 /dev/tty.*
/dev/tty.Bluetooth-Incoming-Port
/dev/tty.DannysHeadphones
/dev/tty.usbserial-0001
```

Note down the new device for later.

## Backing up the Sonoff firmware

Before flashing the new firmware, you should backup the current firmware.

You can learn a bit more about the script being run on the [Zigpy's GitHub documentation](https://github.com/zigpy/zigpy-znp/blob/e3c9fcfdd249e089c578f99c4ed22159e9325c42/TOOLS.md#nvram-backup).

I ran the following, substituting the device noted earlier.

```
$ python3 -m zigpy_znp.tools.nvram_read \
    /dev/tty.usbserial-0001 \
    -o sonoff-firmware-backup.json
```

## Flashing the new firmware

Now it's time to flash the device.
We use the Python script to flash the new firmware, both downloaded earlier.
To better understand the script, you can run it with the flag `--help`.

Run the following, replacing the device and location of the firmware.

```
$ python3 cc2538-bsl.py \
    -p /dev/tty.usbserial-0001 \
    -e -v -w \
    --bootloader-sonoff-usb \
    CC1352P2_CC2652P_launchpad_coordinator_20230507.hex
```

You should see a bunch of output, and ideally this ends by verifying the CRC32 calculation correctly.
Below is an example of the output I saw.

```
$ python3 cc2538-bsl.py -p /dev/tty.usbserial-0001 -e -v -w --bootloader-sonoff-usb ~/Downloads/CC1352P2_CC2652P_launchpad_coordinator_20230507.hex 
sonoff
Opening port /dev/tty.usbserial-0001, baud 500000
Reading data from /Users/danny/Downloads/CC1352P2_CC2652P_launchpad_coordinator_20230507.hex
Your firmware looks like an Intel Hex file
Connecting to target...
CC1350 PG2.1 (7x7mm): 352KB Flash, 20KB SRAM, CCFG.BL_CONFIG at 0x00057FD8
Primary IEEE Address: 00:00:00:00:00:00:00:00
    Performing mass erase
Erasing all main bank flash sectors
    Erase done
Writing 360448 bytes starting at address 0x00000000
Write 104 bytes at 0x00057F988
    Write done                                
Verifying by comparing CRC32 calculations.
    Verified (match: 0xe83aa727)
```

At this point, you should be done and can try it out.
It worked well for me, everything came back as normal.
I'll wait and see if those devices that were dropping off are now more reliable...

Again, a big thanks to [Smart Home Addict's video](https://www.youtube.com/watch?v=fzoiT0mUdkg) on the topic which showed the steps using a Windows machine.
