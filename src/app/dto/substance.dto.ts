import {
    // faPills,faTablets,faJoint,faCannabis,faDrumstickBite,// lunchDiningfaBeerMugEmpty, // sportsBarfaWineGlassEmpty, // wineBarfaMartiniGlass, // localBarfaSyringe,faCreditCard,faSmoking, // smokingRoomsfaBong, faDroplet, // waterDropfaDice, // playingCardsfaSkull, // skullfaSkullCrossbones, //faMortarPestle,faBiohazard,faBanSmoking,
} from "@fortawesome/free-solid-svg-icons";

export enum SubstanceIcon {
    //Pills = "faPills", Tablets = "faTablets", Joint = "faJoint", Cannabis = "faCannabis", DrumstickBite = "faDrumstickBite", BeerMugEmpty = "faBeerMugEmpty", WineGlassEmpty = "faWineGlassEmpty", MartiniGlass = "faMartiniGlass", Syringe = "faSyringe", CreditCard = "faCreditCard", Smoking = "faSmoking", Bong = "faBong", Droplet = "faDroplet", Dice = "faDice", Skull = "faSkull", SkullCrossbones = "faSkullCrossbones", MortarPestle = "faMortarPestle", Biohazard = "faBiohazard", BanSmoking = "faBanSmoking",
    Circle = "circle",
    Hashtag = "hashtag",
    Send = "send",
    Star = "star",
    MapMarker = "map-marker",
    Heart = "heart",
    Cloud = "cloud",
    Comment = "comment",
    Envelope = "envelope",
    Crown = "crown",
    Plus = "plus",
    Minus = "minus",
    ArrowsAlt = "arrows-alt",
    ArrowCircleDown = "arrow-circle-down",
    Bars = "bars",
    Box = "box",
    Moon = "moon",
    Sun = "sun",
    Book = "book",
    Flag = "flag",
    Bell = "bell",
    Key = "key",
    Clock = "clock",
    Bookmark = "bookmark",
    Hammer = "hammer",
    Folder = "folder",
    Refresh = "refresh",
}

// export const SubstanceIconsDefinitions = {
//     "faPills": faPills,
//     "faTablets": faTablets,
//     "faJoint": faJoint,
//     "faCannabis": faCannabis,
//     "faDrumstickBite": faDrumstickBite,
//     "faBeerMugEmpty": faBeerMugEmpty,
//     "faWineGlassEmpty": faWineGlassEmpty,
//     "faMartiniGlass": faMartiniGlass,
//     "faSyringe": faSyringe,
//     "faCreditCard": faCreditCard,
//     "faSmoking": faSmoking,
//     "faBong": faBong,
//     "faDroplet": faDroplet,
//     "faDice": faDice,
//     "faSkull": faSkull,
//     "faSkullCrossbones": faSkullCrossbones,
//     "faMortarPestle": faMortarPestle,
//     "faBiohazard": faBiohazard,
//     "faBanSmoking": faBanSmoking,
// }

export interface SubstanceDto {
    id: number;
    name: string;
    icon?: SubstanceIcon;
}

export type SubstanceAddDto = Pick<SubstanceDto, "name">;

