
/**
 * Use this file to define custom functions and blocks.
 * Read more at https://makecode.microbit.org/blocks/custom
 */


/**
 * Custom blocks
 */
//% weight=90 color=#0fbc11 icon="\uf0ee"
namespace Environment_IoT {
    let dustvled = DigitalPin.P10
    let dustvo = AnalogPin.P1
    let reference_voltage = 3300



    /**
     * TODO: describe your function here
     * @param vLED describe parameter here, eg: DigitalPin.P10
     * @param vo describe parameter here, eg: AnalogPin.P1

*/
    //% blockId="dust_init" block="dust sensor init at vLED %vLED| vo %vo"
    //export function initiotkit(n: number, s: string, e: MyEnum): void {
    export function initdust(vLED: DigitalPin, vo: AnalogPin): void {
        dustvled = vLED
        dustvo = vo
        // Add code here
    }
    


    /**
     * TODO: get dust(μg/m³) 
     * @param value describe value here, eg: 5
     */
    //% blockId="readdust" block="read dust(μg/m³)"
    export function ReadDust(): number {
        let voltage = 0;
        let dust = 0;
        pins.digitalWritePin(dustvled, 0);
        control.waitMicros(280);
        voltage = pins.analogReadPin(dustvo);
        control.waitMicros(40);
        pins.digitalWritePin(dustvled, 1);
        voltage = pins.map(
            voltage,
            0,
            1023,
            0,
            5000
        );
        dust = (voltage - 580) * 5 / 29;
        if (dust < 0){
            dust = 0
        }
        return dust;
    }
    
    

    /**
     * TODO: get TMP36 Temperature(℃)
     * @param temppin describe parameter here, eg: AnalogPin.P0
     */
    //% blockId="readtemp" block="read temperature(℃) at pin %temppin"
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
    

    
    /**
     * TODO: get pm2.5(μg/m³)
     * @param pm25pin describe parameter here, eg: DigitalPin.P11
     */
    //% blockId="readpm25" block="read pm2.5(μg/m³) at pin %pm25pin"
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
    //% blockId="readpm10" block="read pm10(μg/m³) at pin %pm10pin"
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
    * @param soilmoisturepin describe parameter here, eg: AnalogPin.P3
    */
    //% blockId="readsoilmoisture" block="read soil moisture at pin %soilhumiditypin"
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
        return soilmoisture;
    }
    


    /**
    * TODO: get wind speed(m/s)
    * @param windspeedpin describe parameter here, eg: AnalogPin.P4
    */
    //% blockId="readwindspeed" block="read wind speed(m/s) at pin %windspeedpin"
    export function ReadWindSpeed(windspeedpin: AnalogPin): number {
        let voltage = 0;
        let windspeed = 0;
        voltage = pins.map(
            pins.analogReadPin(windspeedpin),
            0,
            1023,
            0,
            reference_voltage
        );
        windspeed = voltage / 40;
        return windspeed;
    }
    



}
