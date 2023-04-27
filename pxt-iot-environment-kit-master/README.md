# environment

Environment and Science IoT package is developed under the cooperation of [ELECFREAKS](https://www.elecfreaks.com/), [CLASSROOM](http://www.classroom.com.hk/) and [TINKERCADEMY](https://tinkercademy.com/).

The ELECFREAKS Environment and Science IoT Kit can detect all kinds of environment data like temperature, humidity, wind speed, light intensity, noise, dust, and PM2.5 level. In addition, you can upload these environment data to the [Thingspeak](https://thingspeak.com) IoT server (free registration required), using the [ESP8266 serial wifi module](http://www.elecfreaks.com/estore/esp8266-serial-wifi-module.html). 

![](https://github.com/elecfreaks/pxt-environment/blob/master/microbit_CEO_and_Environment_Kit.jpg)

## Hardware list 

1. [ELECFREAKS Octopus:bit](http://www.elecfreaks.com/estore/elecfreaks-micro-bit-breakout-board.html).
2. [IIC OLED display](http://www.elecfreaks.com/estore/iic-oled.html)
3. [Sound Sensor](http://www.elecfreaks.com/estore/octopus-analog-noise-sound-sensor-detection-module.html)
4. [Octopus Temperature And Humidity Sensor](http://www.elecfreaks.com/estore/octopus-temperature-and-humidity-sensor.html)
5. [Octopus Soil Moisture Sensor](http://www.elecfreaks.com/estore/octopus-soil-moisture-sensor-brick.html)
6. [Octopus Analog Photocell](http://www.elecfreaks.com/estore/octopus-analog-photocell-brick-obphotocell.html)
7. [Dust Sensor](http://www.elecfreaks.com/estore/octopus-dust-sensor-detector-module-with-sharp-gp2y1010au0f.html)
8. [PM2.5/PM10](http://www.elecfreaks.com/estore/octopus-pm2-5-pm10-detector-sensor-module-optical-dust-sensor-air-conditioner-monitor.html)
9. [Win Sensor](http://www.elecfreaks.com/estore/wind-speed-sensor-anemometer-three-aluminium-cups.html)
10. [ESP8266 Serial Wifi Module](http://www.elecfreaks.com/estore/esp8266-serial-wifi-module.html)

## Basic usage

1. Open [Microsoft Makecode/microbit](https://pxt.microbit.org) and create a new project 
2. Search and add the `environment` package
3. Use the `Environment_IoT` drawer in the editor to drag out and arrange the blocks
4. Click `Download` to move your program to the micro:bit

## Example

### dust sensor init
Initialize dust sensor. Set pin vLED and VO.
```blocks
Environment_IoT.initdust(DigitalPin.P10, AnalogPin.P1)
```

### read dust
get dust(μg/m³) 
```blocks
Environment_IoT.initdust(DigitalPin.P10, AnalogPin.P1)
basic.forever(() => {
    basic.showNumber(Environment_IoT.ReadDust())
})
```

### read temperature
get DHT11 Temperature(℃)
```blocks
basic.forever(() => {
    basic.showNumber(Environment_IoT.ReadTemperature(AnalogPin.P0))
})
```

### read PM2.5
get pm2.5(μg/m³)
```blocks
basic.forever(() => {
    basic.showNumber(Environment_IoT.ReadPM25(DigitalPin.P11))
})
``` 

### read PM10
get pm10(μg/m³)
```blocks
basic.forever(() => {
    basic.showNumber(Environment_IoT.ReadPM10(DigitalPin.P12))
})
```

### read soil moisture
get soil moisture, Value Range: 0~100.
```blocks
basic.forever(() => {
    basic.showNumber(Environment_IoT.ReadSoilHumidity(AnalogPin.P3))
})
```

### read wind speed
get wind speed(m/s)
```blocks
basic.forever(() => {
    basic.showNumber(Environment_IoT.ReadWindSpeed(AnalogPin.P4))
})
```


## License

MIT


## Supported targets

* for PXT/microbit
(The metadata above is needed for package search.)

```package
environment=github:sunnyrainwss/pxt-iot-environment-kit
iot=github:sunnyrainwss/pxt-iot-environment-kit
```



