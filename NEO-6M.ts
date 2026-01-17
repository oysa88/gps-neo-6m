/**
 * NEO-6M GPS
 */
//% weight=50 color=#FF9900 icon="\uf0ac" block="NEO-6M GPS"
//% groups=["Oppsett", "Posisjon", "Bevegelse", "Tid", "Status", "Hendelser"]
namespace NEO6M {

    // --------------------------------------------------------------------
    // Interne variabler
    // --------------------------------------------------------------------
    let gpsFix = false
    let latitudeVal = 0
    let latitudeDirVal = "N"
    let longitudeVal = 0
    let longitudeDirVal = "E"
    let altitudeVal = 0
    let speedVal = 0
    let courseVal = 0
    let hdopVal = 0
    let satellitesVal = 0
    let timeVal = ""
    let dateVal = ""

    // --------------------------------------------------------------------
    // OPPSETT
    // --------------------------------------------------------------------
    //% block="Start GPS | TX %tx RX %rx baud %baud"
    //% group="Oppsett"
    //% weight=80
    export function startGPS(tx: SerialPin, rx: SerialPin, baud: BaudRate) {
        serial.redirect(rx, tx, baud)
        // her kan man starte serial-lytting
    }

    // --------------------------------------------------------------------
    // POSISJON
    // --------------------------------------------------------------------
    //% block="Breddegrad"
    //% group="Posisjon"
    //% weight=70
    export function latitude(): number {
        return latitudeVal
    }

    //% block="Breddegrad retning"
    //% group="Posisjon"
    //% weight=69
    export function latitudeDir(): string {
        return latitudeDirVal
    }

    //% block="Lengdegrad"
    //% group="Posisjon"
    //% weight=68
    export function longitude(): number {
        return longitudeVal
    }

    //% block="Lengdegrad retning"
    //% group="Posisjon"
    //% weight=67
    export function longitudeDir(): string {
        return longitudeDirVal
    }

    //% block="Høyde over havet (m)"
    //% group="Posisjon"
    //% weight=66
    export function altitude(): number {
        return altitudeVal
    }

    // --------------------------------------------------------------------
    // BEVEGELSE
    // --------------------------------------------------------------------
    //% block="Hastighet (m/s)"
    //% group="Bevegelse"
    //% weight=60
    export function speed(): number {
        return speedVal
    }

    //% block="Retning (grader)"
    //% group="Bevegelse"
    //% weight=59
    export function course(): number {
        return courseVal
    }

    // --------------------------------------------------------------------
    // TID
    // --------------------------------------------------------------------
    //% block="Tid (UTC)"
    //% group="Tid"
    //% weight=50
    export function time(): string {
        return timeVal
    }

    //% block="Dato (UTC)"
    //% group="Tid"
    //% weight=49
    export function date(): string {
        return dateVal
    }

    // --------------------------------------------------------------------
    // STATUS
    // --------------------------------------------------------------------
    //% block="Har GPS fix?"
    //% group="Status"
    //% weight=40
    export function hasFix(): boolean {
        return gpsFix
    }

    //% block="Antall satellitter"
    //% group="Status"
    //% weight=39
    export function satellites(): number {
        return satellitesVal
    }

    //% block="HDOP"
    //% group="Status"
    //% weight=38
    export function hdop(): number {
        return hdopVal
    }

    // --------------------------------------------------------------------
    // HENDELSER
    // --------------------------------------------------------------------
    //% block="Når GPS fix oppnås"
    //% group="Hendelser"
    //% weight=30
    export function onFixAcquired(body: () => void) {
        control.inBackground(function () {
            while (true) {
                if (gpsFix) {
                    body()
                    basic.pause(1000)
                }
                basic.pause(500)
            }
        })
    }

    //% block="Når antall satellitter > %n"
    //% n.defl=3
    //% group="Hendelser"
    //% weight=29
    export function onSatellitesAbove(n: number, body: () => void) {
        control.inBackground(function () {
            while (true) {
                if (satellitesVal > n) body()
                basic.pause(1000)
            }
        })
    }

    //% block="Når HDOP < %v"
    //% v.defl=2
    //% group="Hendelser"
    //% weight=28
    export function onHDOPBelow(v: number, body: () => void) {
        control.inBackground(function () {
            while (true) {
                if (hdopVal < v) body()
                basic.pause(1000)
            }
        })
    }
}