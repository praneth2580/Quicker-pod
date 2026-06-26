.method public final crc16([B)I
    .locals 8

    const-string v0, "data"

    invoke-static {p1, v0}, Lkotlin/jvm/internal/Intrinsics;->f(Ljava/lang/Object;Ljava/lang/String;)V

    array-length v0, p1

    const v1, 0xffff

    const/4 v2, 0x0

    move v4, v1

    move v3, v2

    :goto_0
    if-ge v3, v0, :cond_2

    aget-byte v5, p1, v3

    and-int/lit16 v5, v5, 0xff

    const/16 v6, 0x8

    shl-int/2addr v5, v6

    xor-int/2addr v4, v5

    move v5, v2

    :goto_1
    if-ge v5, v6, :cond_1

    const v7, 0x8000

    and-int/2addr v7, v4

    shl-int/lit8 v4, v4, 0x1

    if-eqz v7, :cond_0

    xor-int/lit16 v4, v4, 0x1021

    :cond_0
    and-int/2addr v4, v1

    add-int/lit8 v5, v5, 0x1

    goto :goto_1

    :cond_1
    add-int/lit8 v3, v3, 0x1

    goto :goto_0

    :cond_2
    return v4
.end method
