.method public final buildNavPacket(BIBBBBB)[B
    .locals 4

    const/16 v0, 0x14

    new-array v0, v0, [B

    const/16 v1, 0x10

    const/4 v2, 0x0

    aput-byte v1, v0, v2

    const/4 v1, 0x1

    const/16 v3, 0x11

    aput-byte v3, v0, v1

    const/4 v1, 0x2

    aput-byte p1, v0, v1

    shr-int/lit8 p1, p2, 0x8

    and-int/lit16 p1, p1, 0xff

    int-to-byte p1, p1

    const/4 v1, 0x3

    aput-byte p1, v0, v1

    and-int/lit16 p2, p2, 0xff

    int-to-byte p2, p2

    const/4 v3, 0x4

    aput-byte p2, v0, v3

    const/4 v3, 0x5

    aput-byte p3, v0, v3

    const/4 p3, 0x6

    aput-byte p4, v0, p3

    const/4 p3, 0x7

    aput-byte p5, v0, p3

    const/16 p3, 0x8

    aput-byte p1, v0, p3

    const/16 p1, 0x9

    aput-byte p2, v0, p1

    const/16 p1, 0xa

    aput-byte p6, v0, p1

    const/16 p1, 0xb

    aput-byte v2, v0, p1

    const/16 p1, 0xc

    aput-byte p7, v0, p1

    const/16 p1, 0xd

    aput-byte v1, v0, p1

    invoke-direct {p0, v0}, Lcom/supertripper/app/TripperProtocol;->appendCrc([B)[B

    move-result-object p1

    return-object p1
.end method
