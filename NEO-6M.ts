//% weight=90 color=#FF9900 icon="\uf0ac" block="NEO-6M - GPS"
//% groups=['Oppstart', 'Posisjon', 'Kvalitet', 'Bevegelse', 'Tid', 'Telemetri', 'other']
namespace neo6mGPS {
    let gpsTxPin = SerialPin.P1
    let gpsRxPin = SerialPin.P0
    let started = false

    let breddegrad = 0
    let lengdegrad = 0
    let hoyde = 0
    let satellitter = 0
    let fix = 0
    let utcTid = ""
    let fartKnop = 0
    let hdop = 0
    let kurs = 0

    function brukGPS() {
        // MakeCode: serial.redirect(TX, RX, baud)
        // Bruker velger GPS TX og GPS RX
        // Derfor må vi bytte om internt:
        // micro:bit TX -> GPS RX
        // micro:bit RX <- GPS TX
        serial.redirect(gpsRxPin, gpsTxPin, BaudRate.BaudRate9600)
    }

    function round5(value: number): number {
        return Math.round(value * 100000) / 100000
    }

    function round1(value: number): number {
        return Math.round(value * 10) / 10
    }

    function round2(value: number): number {
        return Math.round(value * 100) / 100
    }

    function nmeaToDecimal(raw: string, dir: string, isLon: boolean): number {
        if (raw == "") return 0

        let degrees = 0
        let minutes = 0

        if (isLon) {
            if (raw.length < 4) return 0
            degrees = parseFloat(raw.substr(0, 3))
            minutes = parseFloat(raw.substr(3))
        } else {
            if (raw.length < 3) return 0
            degrees = parseFloat(raw.substr(0, 2))
            minutes = parseFloat(raw.substr(2))
        }

        let decimal = degrees + minutes / 60

        if (dir == "S" || dir == "W") {
            decimal = 0 - decimal
        }

        return round5(decimal)
    }

    function parseGGA(nmea: string) {
        let parts = nmea.split(",")

        if (parts.length > 9) {
            if (parts[1] != "") {
                utcTid = parts[1]
            }

            if (parts[2] != "" && parts[3] != "" && parts[4] != "" && parts[5] != "") {
                breddegrad = nmeaToDecimal(parts[2], parts[3], false)
                lengdegrad = nmeaToDecimal(parts[4], parts[5], true)
            }

            fix = parseInt(parts[6]) || 0
            satellitter = parseInt(parts[7]) || 0
            hdop = parseFloat(parts[8]) || 0
            hoyde = parseFloat(parts[9]) || 0
        }
    }

    function parseRMC(nmea: string) {
        let parts = nmea.split(",")

        if (parts.length > 8) {
            if (parts[1] != "") {
                utcTid = parts[1]
            }

            if (parts[7] != "") {
                fartKnop = parseFloat(parts[7]) || 0
            }

            if (parts[8] != "") {
                kurs = parseFloat(parts[8]) || 0
            }
        }
    }

    /**
     * Start GPS
     */
    //% block="start GPS | GPS TX %txPin GPS RX %rxPin"
    //% txPin.defl=SerialPin.P1
    //% rxPin.defl=SerialPin.P0
    //% group="Oppstart"
    export function startGPS(txPin: SerialPin, rxPin: SerialPin): void {
        gpsTxPin = txPin
        gpsRxPin = rxPin

        serial.setRxBufferSize(128)
        brukGPS()

        if (started) return
        started = true

        serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
            let line = serial.readLine()

            if (line) {
                line = line.replace("\r", "")
            }

            if (!line || line.length == 0) return

            if (line.indexOf("$GPGGA") == 0 || line.indexOf("$GNGGA") == 0) {
                parseGGA(line)
            }

            if (line.indexOf("$GPRMC") == 0 || line.indexOf("$GNRMC") == 0) {
                parseRMC(line)
            }
        })
    }

    /**
     * Breddegrad i desimalgrader
     */
    //% block="breddegrad"
    //% group="Posisjon"
    export function hentBreddegrad(): number {
        return breddegrad
    }

    /**
     * Lengdegrad i desimalgrader
     */
    //% block="lengdegrad"
    //% group="Posisjon"
    export function hentLengdegrad(): number {
        return lengdegrad
    }

    /**
     * Høyde over havet i meter
     */
    //% block="høyde"
    //% group="Posisjon"
    export function hentHoyde(): number {
        return hoyde
    }

    /**
     * Antall satellitter
     */
    //% block="satellitter"
    //% group="Kvalitet"
    export function hentSatellitter(): number {
        return satellitter
    }

    /**
     * Har GPS fix
     */
    //% block="har GPS fix"
    //% group="Kvalitet"
    export function harFix(): boolean {
        return fix > 0
    }

    /**
     * GPS fix-verdi
     */
    //% block="fix-verdi"
    //% group="Kvalitet"
    export function hentFix(): number {
        return fix
    }

    /**
     * HDOP
     */
    //% block="HDOP"
    //% group="Kvalitet"
    export function hentHDOP(): number {
        return round2(hdop)
    }

    /**
     * GPS tid UTC
     */
    //% block="GPS tid UTC"
    //% group="Tid"
    export function hentTidUTC(): string {
        return utcTid
    }

    /**
     * Fart i knop
     */
    //% block="fart i knop"
    //% group="Bevegelse"
    export function hentFartKnop(): number {
        return round1(fartKnop)
    }

    /**
     * Fart i km/t
     */
    //% block="fart i km/t"
    //% group="Bevegelse"
    export function hentFartKmT(): number {
        return round1(fartKnop * 1.852)
    }

    /**
     * Retning / kurs i grader
     */
    //% block="retning"
    //% group="Bevegelse"
    export function hentRetning(): number {
        return round1(kurs)
    }

    /**
     * Lag telemetripakke
     */
    //% block="telemetripakke"
    //% group="Telemetri"
    export function hentTelemetripakke(): string {
        return "" + utcTid + "," +
            breddegrad + "," +
            lengdegrad + "," +
            hoyde + "," +
            satellitter + "," +
            fix + "," +
            round2(hdop) + "," +
            round1(fartKnop * 1.852) + "," +
            round1(kurs)
    }
}