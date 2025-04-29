
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

export interface SubstanceDto {
    id: number;
    name: string;
    icon?: SubstanceIcon;
}

export type SubstanceAddDto = Pick<SubstanceDto, "name">;

