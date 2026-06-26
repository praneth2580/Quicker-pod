.class public final Lbluconnect/k2h;
.super Ljava/lang/Object;
.source "SourceFile"


# annotations
.annotation build Lcom/newrelic/agent/android/instrumentation/Instrumented;
.end annotation


# static fields
.field public static final a:Lbluconnect/k2h;
    .annotation build Lbluconnect/ejh;
    .end annotation
.end field

.field public static final b:[B
    .annotation build Lbluconnect/ejh;
    .end annotation
.end field


# direct methods
.method static constructor <clinit>()V
    .locals 1

    new-instance v0, Lbluconnect/k2h;

    invoke-direct {v0}, Ljava/lang/Object;-><init>()V

    sput-object v0, Lbluconnect/k2h;->a:Lbluconnect/k2h;

    const/16 v0, 0x14

    new-array v0, v0, [B

    sput-object v0, Lbluconnect/k2h;->b:[B

    return-void
.end method

.method public constructor <init>()V
    .locals 0

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    return-void
.end method

.method public static synthetic e(Lbluconnect/k2h;IIIIIIIIIIIIIIIIILjava/lang/Object;)[B
    .locals 17

    move/from16 v0, p17

    and-int/lit8 v1, v0, 0x1

    if-eqz v1, :cond_0

    const/4 v1, 0x0

    goto :goto_0

    :cond_0
    move/from16 v1, p1

    :goto_0
    and-int/lit8 v3, v0, 0x2

    if-eqz v3, :cond_1

    const/4 v3, 0x0

    goto :goto_1

    :cond_1
    move/from16 v3, p2

    :goto_1
    and-int/lit8 v4, v0, 0x4

    const/4 v5, -0x1

    if-eqz v4, :cond_2

    move v4, v5

    goto :goto_2

    :cond_2
    move/from16 v4, p3

    :goto_2
    and-int/lit8 v6, v0, 0x8

    if-eqz v6, :cond_3

    const/4 v6, 0x0

    goto :goto_3

    :cond_3
    move/from16 v6, p4

    :goto_3
    and-int/lit8 v7, v0, 0x10

    if-eqz v7, :cond_4

    const/4 v7, 0x5

    goto :goto_4

    :cond_4
    move/from16 v7, p5

    :goto_4
    and-int/lit8 v8, v0, 0x20

    const/4 v9, 0x1

    if-eqz v8, :cond_5

    move v8, v9

    goto :goto_5

    :cond_5
    move/from16 v8, p6

    :goto_5
    and-int/lit8 v10, v0, 0x40

    if-eqz v10, :cond_6

    goto :goto_6

    :cond_6
    move/from16 v5, p7

    :goto_6
    and-int/lit16 v10, v0, 0x80

    if-eqz v10, :cond_7

    const/4 v10, 0x0

    goto :goto_7

    :cond_7
    move/from16 v10, p8

    :goto_7
    and-int/lit16 v11, v0, 0x100

    if-eqz v11, :cond_8

    move v11, v9

    goto :goto_8

    :cond_8
    move/from16 v11, p9

    :goto_8
    and-int/lit16 v12, v0, 0x200

    if-eqz v12, :cond_9

    move v12, v9

    goto :goto_9

    :cond_9
    move/from16 v12, p10

    :goto_9
    and-int/lit16 v13, v0, 0x400

    if-eqz v13, :cond_a

    const/4 v13, 0x0

    goto :goto_a

    :cond_a
    move/from16 v13, p11

    :goto_a
    and-int/lit16 v14, v0, 0x800

    if-eqz v14, :cond_b

    goto :goto_b

    :cond_b
    move/from16 v9, p12

    :goto_b
    and-int/lit16 v14, v0, 0x1000

    if-eqz v14, :cond_c

    const/4 v14, 0x0

    goto :goto_c

    :cond_c
    move/from16 v14, p13

    :goto_c
    and-int/lit16 v15, v0, 0x2000

    if-eqz v15, :cond_d

    const/4 v15, 0x0

    goto :goto_d

    :cond_d
    move/from16 v15, p14

    :goto_d
    and-int/lit16 v2, v0, 0x4000

    if-eqz v2, :cond_e

    const/4 v2, 0x0

    goto :goto_e

    :cond_e
    move/from16 v2, p15

    :goto_e
    const v16, 0x8000

    and-int v0, v0, v16

    if-eqz v0, :cond_f

    const/16 p17, 0x0

    :goto_f
    move-object/from16 p1, p0

    move/from16 p2, v1

    move/from16 p16, v2

    move/from16 p3, v3

    move/from16 p4, v4

    move/from16 p8, v5

    move/from16 p5, v6

    move/from16 p6, v7

    move/from16 p7, v8

    move/from16 p13, v9

    move/from16 p9, v10

    move/from16 p10, v11

    move/from16 p11, v12

    move/from16 p12, v13

    move/from16 p14, v14

    move/from16 p15, v15

    goto :goto_10

    :cond_f
    move/from16 p17, p16

    goto :goto_f

    :goto_10
    invoke-virtual/range {p1 .. p17}, Lbluconnect/k2h;->d(IIIIIIIIIIIIIIII)[B

    move-result-object v0

    return-object v0
.end method


# virtual methods
.method public final a([B)Ljava/lang/String;
    .locals 4
    .param p1    # [B
        .annotation build Lbluconnect/ejh;
        .end annotation
    .end param
    .annotation build Lbluconnect/ejh;
    .end annotation

    const-string p0, "a"

    invoke-static {p1, p0}, Lkotlin/jvm/internal/Intrinsics;->p(Ljava/lang/Object;Ljava/lang/String;)V

    new-instance p0, Ljava/lang/StringBuilder;

    array-length v0, p1

    mul-int/lit8 v0, v0, 0x2

    invoke-direct {p0, v0}, Ljava/lang/StringBuilder;-><init>(I)V

    const-string v0, "\n"

    invoke-virtual {p0, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    array-length v0, p1

    const/4 v1, 0x0

    :goto_0
    if-ge v1, v0, :cond_0

    sget-object v2, Lkotlin/jvm/internal/StringCompanionObject;->a:Lkotlin/jvm/internal/StringCompanionObject;

    aget-byte v2, p1, v1

    invoke-static {v2}, Ljava/lang/Byte;->valueOf(B)Ljava/lang/Byte;

    move-result-object v2

    filled-new-array {v2}, [Ljava/lang/Object;

    move-result-object v2

    const/4 v3, 0x1

    invoke-static {v2, v3}, Ljava/util/Arrays;->copyOf([Ljava/lang/Object;I)[Ljava/lang/Object;

    move-result-object v2

    const-string v3, "%02X"

    invoke-static {v3, v2}, Ljava/lang/String;->format(Ljava/lang/String;[Ljava/lang/Object;)Ljava/lang/String;

    move-result-object v2

    invoke-virtual {p0, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    add-int/lit8 v1, v1, 0x1

    goto :goto_0

    :cond_0
    invoke-virtual {p0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p0

    const-string p1, "toString(...)"

    invoke-static {p0, p1}, Lkotlin/jvm/internal/Intrinsics;->o(Ljava/lang/Object;Ljava/lang/String;)V

    return-object p0
.end method

.method public final b([B)[B
    .locals 9
    .param p1    # [B
        .annotation build Lbluconnect/ejh;
        .end annotation
    .end param
    .annotation build Lbluconnect/ejh;
    .end annotation

    const-string p0, "bytes"

    invoke-static {p1, p0}, Lkotlin/jvm/internal/Intrinsics;->p(Ljava/lang/Object;Ljava/lang/String;)V

    array-length p0, p1

    const v0, 0xffff

    const/4 v1, 0x0

    move v3, v0

    move v2, v1

    :goto_0
    const/4 v4, 0x1

    if-ge v2, p0, :cond_4

    aget-byte v5, p1, v2

    move v6, v1

    :goto_1
    const/16 v7, 0x8

    if-ge v6, v7, :cond_3

    rsub-int/lit8 v7, v6, 0x7

    shr-int v7, v5, v7

    if-ne v7, v4, :cond_0

    move v7, v4

    goto :goto_2

    :cond_0
    move v7, v1

    :goto_2
    shr-int/lit8 v8, v3, 0xf

    and-int/2addr v8, v4

    if-ne v8, v4, :cond_1

    move v8, v4

    goto :goto_3

    :cond_1
    move v8, v1

    :goto_3
    shl-int/lit8 v3, v3, 0x1

    xor-int/2addr v7, v8

    if-eqz v7, :cond_2

    xor-int/lit16 v3, v3, 0x1021

    :cond_2
    add-int/lit8 v6, v6, 0x1

    goto :goto_1

    :cond_3
    add-int/lit8 v2, v2, 0x1

    goto :goto_0

    :cond_4
    and-int p0, v3, v0

    const/4 p1, 0x4

    invoke-static {p1}, Ljava/nio/ByteBuffer;->allocate(I)Ljava/nio/ByteBuffer;

    move-result-object p1

    invoke-virtual {p1, p0}, Ljava/nio/ByteBuffer;->putInt(I)Ljava/nio/ByteBuffer;

    invoke-virtual {p1}, Ljava/nio/ByteBuffer;->array()[B

    move-result-object p0

    const/4 p1, 0x2

    aget-byte v0, p0, p1

    const/4 v2, 0x3

    aget-byte p0, p0, v2

    new-array p1, p1, [B

    aput-byte v0, p1, v1

    aput-byte p0, p1, v4

    return-object p1
.end method

.method public final c()[B
    .locals 0
    .annotation build Lbluconnect/ejh;
    .end annotation

    sget-object p0, Lbluconnect/k2h;->b:[B

    return-object p0
.end method

.method public final d(IIIIIIIIIIIIIIII)[B
    .locals 7
    .annotation build Lbluconnect/ejh;
    .end annotation

    move/from16 v0, p12

    sget-object v1, Lbluconnect/k2h;->b:[B

    const/16 v2, 0x10

    const/4 v3, 0x0

    aput-byte v2, v1, v3

    and-int/lit8 p1, p1, 0xf

    int-to-byte p1, p1

    const/4 v2, 0x4

    shl-int/2addr p1, v2

    int-to-byte p1, p1

    and-int/lit8 p2, p2, 0xf

    int-to-byte p2, p2

    or-int/2addr p1, p2

    int-to-byte p1, p1

    const/4 p2, 0x1

    aput-byte p1, v1, p2

    and-int/lit16 p1, p3, 0xff

    int-to-byte p1, p1

    const/4 p3, 0x2

    aput-byte p1, v1, p3

    invoke-static {v2}, Ljava/nio/ByteBuffer;->allocate(I)Ljava/nio/ByteBuffer;

    move-result-object p1

    invoke-virtual {p1, p4}, Ljava/nio/ByteBuffer;->putInt(I)Ljava/nio/ByteBuffer;

    invoke-virtual {p1}, Ljava/nio/ByteBuffer;->array()[B

    move-result-object p1

    aget-byte p4, p1, p3

    const/4 v4, 0x3

    aput-byte p4, v1, v4

    aget-byte p1, p1, v4

    aput-byte p1, v1, v2

    and-int/lit16 p1, p6, 0xff

    int-to-byte p1, p1

    const/4 p4, 0x5

    aput-byte p1, v1, p4

    and-int/lit8 p1, p5, 0xf

    shl-int/2addr p1, v2

    and-int/lit8 p4, p16, 0xf

    or-int/2addr p1, p4

    int-to-byte p1, p1

    const/4 p4, 0x6

    aput-byte p1, v1, p4

    and-int/lit16 p1, p7, 0xff

    int-to-byte p1, p1

    const/4 v5, 0x7

    aput-byte p1, v1, v5

    invoke-static {v2}, Ljava/nio/ByteBuffer;->allocate(I)Ljava/nio/ByteBuffer;

    move-result-object p1

    invoke-virtual {p1, p8}, Ljava/nio/ByteBuffer;->putInt(I)Ljava/nio/ByteBuffer;

    invoke-virtual {p1}, Ljava/nio/ByteBuffer;->array()[B

    move-result-object p1

    const/16 v5, 0x8

    aget-byte v6, p1, p3

    aput-byte v6, v1, v5

    const/16 v5, 0x9

    aget-byte p1, p1, v4

    aput-byte p1, v1, v5

    and-int/lit8 p1, p9, 0xf

    int-to-byte p1, p1

    shl-int/2addr p1, v2

    int-to-byte p1, p1

    and-int/lit8 v5, p10, 0xf

    int-to-byte v5, v5

    or-int/2addr p1, v5

    int-to-byte p1, p1

    const/16 v5, 0xa

    aput-byte p1, v1, v5

    and-int/lit16 p1, v0, 0xff

    int-to-byte p1, p1

    const/16 v5, 0xd

    aput-byte p1, v1, v5

    const/16 p1, 0xc

    const/16 v5, 0xb

    if-nez v0, :cond_0

    and-int/lit8 p3, p13, 0x3

    shl-int/2addr p3, p4

    and-int/lit8 p4, p14, 0x3f

    or-int/2addr p3, p4

    int-to-byte p3, p3

    aput-byte p3, v1, v5

    move/from16 p3, p15

    and-int/lit16 p3, p3, 0xff

    int-to-byte p3, p3

    aput-byte p3, v1, p1

    goto :goto_0

    :cond_0
    invoke-static {v2}, Ljava/nio/ByteBuffer;->allocate(I)Ljava/nio/ByteBuffer;

    move-result-object p4

    move/from16 v0, p11

    invoke-virtual {p4, v0}, Ljava/nio/ByteBuffer;->putInt(I)Ljava/nio/ByteBuffer;

    invoke-virtual {p4}, Ljava/nio/ByteBuffer;->array()[B

    move-result-object p4

    aget-byte p3, p4, p3

    aput-byte p3, v1, v5

    aget-byte p3, p4, v4

    aput-byte p3, v1, p1

    :goto_0
    const/16 p1, 0x12

    new-array p3, p1, [B

    move p4, v3

    :goto_1
    if-ge p4, p1, :cond_1

    sget-object v0, Lbluconnect/k2h;->b:[B

    aget-byte v0, v0, p4

    aput-byte v0, p3, p4

    add-int/lit8 p4, p4, 0x1

    goto :goto_1

    :cond_1
    invoke-virtual {p0, p3}, Lbluconnect/k2h;->a([B)Ljava/lang/String;

    invoke-static {p3}, Lbluconnect/xj3;->b([B)[B

    move-result-object p0

    sget-object p3, Lbluconnect/k2h;->b:[B

    aget-byte p4, p0, v3

    aput-byte p4, p3, p1

    const/16 p1, 0x13

    aget-byte p0, p0, p2

    aput-byte p0, p3, p1

    return-object p3
.end method
