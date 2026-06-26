.method public final buildCompassPacket(BZ)[B
    .locals 3

    const/16 v0, 0x14

    new-array v0, v0, [B

    const/4 v1, 0x0

    const/16 v2, 0x10

    aput-byte v2, v0, v1

    const/4 v1, 0x1

    const/16 v2, 0x11

    aput-byte v2, v0, v1

    const/4 v1, 0x2

    const/16 v2, 0x41

    aput-byte v2, v0, v1

    const/4 v1, 0x6

    aput-byte p2, v0, v1

    const/4 p2, 0x7

    const/4 v1, -0x1

    aput-byte v1, v0, p2

    const/16 p2, 0xb

    aput-byte v1, v0, p2

    const/16 p2, 0xc

    aput-byte v1, v0, p2

    const/16 p2, 0xd

    aput-byte v1, v0, p2

    const/16 p2, 0xe

    aput-byte p1, v0, p2

    invoke-direct {p0, v0}, Lcom/supertripper/app/TripperProtocol;->appendCrc([B)[B

    move-result-object p1

    return-object p1
.end method
