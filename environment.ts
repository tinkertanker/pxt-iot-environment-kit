/**
 * Use this file to define custom functions and blocks.
 * Read more at https://www.elecfreaks.com
 */

enum DHT11Type {
    //% block="temperature(℃)" enumval=0
    DHT11_temperature_C,

    //% block="temperature(℉)" enumval=1
    DHT11_temperature_F,

    //% block="humidity(0~100)" enumval=2
    DHT11_humidity,
}


enum Distance_Unit {
    //% block="mm" enumval=0
    Distance_Unit_mm,

    //% block="cm" enumval=1
    Distance_Unit_cm,

    //% block="inch" enumval=2
    Distance_Unit_inch,
}


/**
 * Custom blocks
 */
//% weight=90 color=#007a4b icon="\uf0ee"
namespace Environment {

    let Reference_VOLTAGE = 3100

    /**
     * TODO: get dust(μg/m³) 
     * @param vLED describe parameter here, eg: DigitalPin.P9
     * @param vo describe parameter here, eg: AnalogPin.P10
     */
    //% blockId="readdust" block="value of dust(μg/m³) at vLED %vLED| vo %vo"
    export function ReadDust(vLED: DigitalPin, vo: AnalogPin): number {
        let voltage = 0;
        let dust = 0;
        pins.digitalWritePin(vLED, 0);
        control.waitMicros(160);
        voltage = pins.analogReadPin(vo);
        control.waitMicros(100);
        pins.digitalWritePin(vLED, 1);
        voltage = pins.map(
            voltage,
            0,
            1023,
            0,
            Reference_VOLTAGE / 2 * 3
        );
        dust = (voltage - 380) * 5 / 29;
        if (dust < 0) {
            dust = 0
        }
        return Math.round(dust)

    }


    /**
    * get Ultrasonic(sonar:bit) distance 
    */
    //% blockId=readsonarbit block="Ultrasonic distance in unit %distance_unit |at|pin %pin"
    export function sonarbit_distance(distance_unit: Distance_Unit, pin: DigitalPin): number {

        // send pulse
        pins.setPull(pin, PinPullMode.PullNone)
        pins.digitalWritePin(pin, 0)
        control.waitMicros(2)
        pins.digitalWritePin(pin, 1)
        control.waitMicros(10)
        pins.digitalWritePin(pin, 0)

        // read pulse
        let d = pins.pulseIn(pin, PulseValue.High, 23000)  // 8 / 340 = 
        let distance = d * 10 * 5 / 3 / 58

        if (distance > 4000) distance = 0

        switch (distance_unit) {
            case 0:
                return Math.round(distance) //mm
                break
            case 1:
                return Math.round(distance / 10)  //cm
                break
            case 2:
                return Math.round(distance / 25)  //inch
                break
            default:
                return 0

        }

    }



    /**
    * TODO: get TMP36 Temperature(℃)
    * @param temppin describe parameter here, eg: AnalogPin.P0
    */
    //% blockId="readtemp" block="read temperature(℃) at pin %temppin"

    /*
    export function ReadTemperature(temppin: AnalogPin): number {
        let voltage = 0;
        let Temperature = 0;
        voltage = pins.map(
            pins.analogReadPin(temppin),
            0,
            1023,
            0,
            reference_voltage
        );
        Temperature = (voltage - 500) / 10;
        return Temperature;
    }
    */

    /**
     * TODO: get DHT11
     * @param dht11pin describe parameter here, eg: DigitalPin.P13     */
    //% blockId="readdht11" block="value of dht11 %dht11type| at pin %dht11pin"
    export function temperature(dht11type: DHT11Type, dht11pin: DigitalPin): number {
        pins.digitalWritePin(dht11pin, 0)
        basic.pause(18)
        let i = pins.digitalReadPin(dht11pin)
        pins.setPull(dht11pin, PinPullMode.PullUp);

        while (pins.digitalReadPin(dht11pin) == 1);
        while (pins.digitalReadPin(dht11pin) == 0);
        while (pins.digitalReadPin(dht11pin) == 1);

        let value = 0;
        let counter = 0;
        let error = 0;

        for (let i = 0; i <= 32 - 1; i++) {
            while (pins.digitalReadPin(dht11pin) == 0) {
                //check if the wait is too long, 1000 is arbituary
                counter++;
                if (counter == 1000) {
                    error = 1;
                }
            }
            counter = 0
            while (pins.digitalReadPin(dht11pin) == 1) {
                counter += 1;
            }
            if (counter > 3) {
                value = value + (1 << (31 - i));
                //check if the wait is too long, 1000 is arbituary
                if (counter >= 1000) {
                    error = 2;
                }
            }
        }
        if (error == 1) {
            return 1001;
        }
        else if (error == 2) {
            return 1002;
        }
        else {
            switch (dht11type) {
                case 0:
                    return (value & 0x0000ff00) >> 8
                    break;
                case 1:
                    return ((value & 0x0000ff00) >> 8) * 9 / 5 + 32
                    break;
                case 2:
                    return value >> 24
                    break;
                default:
                    return 0;
            }
        }

    }






    /**
    * TODO: get pm2.5(μg/m³)
    * @param pm25pin describe parameter here, eg: DigitalPin.P11
    */
    //% blockId="readpm25" block="value of pm2.5(μg/m³) at pin %pm25pin"
    export function ReadPM25(pm25pin: DigitalPin): number {
        let pm25 = 0
        while (pins.digitalReadPin(pm25pin) != 0) {
        }
        while (pins.digitalReadPin(pm25pin) != 1) {
        }
        pm25 = input.runningTimeMicros()
        while (pins.digitalReadPin(pm25pin) != 0) {
        }
        pm25 = input.runningTimeMicros() - pm25
        pm25 = pm25 / 1000 - 2
        return pm25;
    }



    /**
    * TODO: get pm10(μg/m³)
    * @param pm10pin describe parameter here, eg: DigitalPin.P12     */
    //% blockId="readpm10" block="value of pm10(μg/m³) at pin %pm10pin"
    export function ReadPM10(pm10pin: DigitalPin): number {
        let pm10 = 0
        while (pins.digitalReadPin(pm10pin) != 0) {
        }
        while (pins.digitalReadPin(pm10pin) != 1) {
        }
        pm10 = input.runningTimeMicros()
        while (pins.digitalReadPin(pm10pin) != 0) {
        }
        pm10 = input.runningTimeMicros() - pm10
        pm10 = pm10 / 1000 - 2
        return pm10;
    }




    /**
    * TODO: get soil moisture(0~100)
    * @param soilmoisturepin describe parameter here, eg: AnalogPin.P2
    */
    //% blockId="readsoilmoisture" block="value of soil moisture(0~100) at pin %soilhumiditypin"
    export function ReadSoilHumidity(soilmoisturepin: AnalogPin): number {
        let voltage = 0;
        let soilmoisture = 0;
        voltage = pins.map(
            pins.analogReadPin(soilmoisturepin),
            0,
            1023,
            0,
            100
        );
        soilmoisture = voltage;
        return Math.round(soilmoisture)
    }


    /**
    * TODO: get light intensity(0~100)
    * @param lightintensitypin describe parameter here, eg: AnalogPin.P3
    */
    //% blockId="readlightintensity" block="value of light intensity(0~100) at pin %lightintensitypin"
    export function ReadLightIntensity(lightintensitypin: AnalogPin): number {
        let voltage = 0;
        let lightintensity = 0;
        voltage = pins.map(
            pins.analogReadPin(lightintensitypin),
            0,
            1023,
            0,
            100
        );
        lightintensity = voltage;
        return Math.round(lightintensity)
    }



    /**
    * TODO: get wind speed(m/s)
    * @param windspeedpin describe parameter here, eg: AnalogPin.P4
    */
    //% blockId="readwindspeed" block="value of wind speed(m/s) at pin %windspeedpin"
    export function ReadWindSpeed(windspeedpin: AnalogPin): number {
        let voltage = 0;
        let windspeed = 0;
        voltage = pins.map(
            pins.analogReadPin(windspeedpin),
            0,
            1023,
            0,
            Reference_VOLTAGE
        );
        windspeed = voltage / 40;
        return Math.round(windspeed)
    }



    /** 
    * TODO: get noise(dB)
    * @param noisepin describe parameter here, eg: AnalogPin.P1
    */
    //% blockId="readnoise" block="value of noise(dB) at pin %noisepin"
    export function ReadNoise(noisepin: AnalogPin): number {
        let level = 0
        let voltage = 0
        let noise = 0
        let h = 0
        let l = 0
        let sumh = 0
        let suml = 0
        for (let i = 0; i < 1000; i++) {
            level = level + pins.analogReadPin(noisepin)
        }
        level = level / 1000
        for (let i = 0; i < 1000; i++) {
            voltage = pins.analogReadPin(noisepin)
            if (voltage >= level) {
                h += 1
                sumh = sumh + voltage
            } else {
                l += 1
                suml = suml + voltage
            }
        }
        if (h == 0) {
            sumh = level
        } else {
            sumh = sumh / h
        }
        if (l == 0) {
            suml = level
        } else {
            suml = suml / l
        }
        noise = sumh - suml
        if (noise <= 4) {
            noise = pins.map(
                noise,
                0,
                4,
                30,
                50
            )
        } else if (noise <= 8) {
            noise = pins.map(
                noise,
                4,
                8,
                50,
                55
            )
        } else if (noise <= 14) {
            noise = pins.map(
                noise,
                9,
                14,
                55,
                60
            )
        } else if (noise <= 32) {
            noise = pins.map(
                noise,
                15,
                32,
                60,
                70
            )
        } else if (noise <= 60) {
            noise = pins.map(
                noise,
                33,
                60,
                70,
                75
            )
        } else if (noise <= 100) {
            noise = pins.map(
                noise,
                61,
                100,
                75,
                80
            )
        } else if (noise <= 150) {
            noise = pins.map(
                noise,
                101,
                150,
                80,
                85
            )
        } else if (noise <= 231) {
            noise = pins.map(
                noise,
                151,
                231,
                85,
                90
            )
        } else {
            noise = pins.map(
                noise,
                231,
                1023,
                90,
                120
            )
        }
        noise = Math.round(noise)
        return Math.round(noise)
    }


}

