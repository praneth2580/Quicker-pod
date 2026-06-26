.method private final appendCrc([B)[B
    .locals 4

    new-instance v0, Lkotlin/ranges/IntRange;

    const/4 v1, 0x1

    const/4 v2, 0x0

    const/16 v3, 0x11

    invoke-direct {v0, v2, v3, v1}, Lkotlin/ranges/IntProgression;-><init>(III)V

    invoke-static {p1, v0}, Lkotlin/collections/c;->h0([BLkotlin/ranges/IntRange;)[B

    move-result-object v0

    invoke-virtual {p0, v0}, Lcom/supertripper/app/TripperProtocol;->crc16([B)I

    move-result v0

    shr-int/lit8 v1, v0, 0x8

    and-int/lit16 v1, v1, 0xff

    int-to-byte v1, v1

    const/16 v2, 0x12

    aput-byte v1, p1, v2

    and-int/lit16 v0, v0, 0xff

    int-to-byte v0, v0

    const/16 v1, 0x13

    aput-byte v0, p1, v1

    return-object p1
.end method
