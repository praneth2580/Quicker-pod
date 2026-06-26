.class public final Lbluconnect/j2h;
.super Ljava/lang/Object;
.source "SourceFile"


# annotations
.annotation build Lcom/newrelic/agent/android/instrumentation/Instrumented;
.end annotation


# static fields
.field public static final a:Lbluconnect/j2h;
    .annotation build Lbluconnect/ejh;
    .end annotation
.end field

.field public static final b:I = 0x1

.field public static final c:I = 0x2

.field public static final d:I = 0x3

.field public static final e:I = 0x4

.field public static final f:I = 0x0

.field public static final g:I = 0x1e

.field public static final h:I = 0x1

.field public static final i:I = 0xa

.field public static final j:I = 0x2

.field public static final k:I = 0x14

.field public static final l:D = 3.281

.field public static final m:D = 6.21371192E-4

.field public static final n:I = 0x226

.field public static final o:I = 0x3e7

.field public static final p:I = 0xc

.field public static final q:I = 0xa

.field public static final r:I = 0x14

.field public static final s:I = 0x1e


# direct methods
.method static constructor <clinit>()V
    .locals 1

    new-instance v0, Lbluconnect/j2h;

    invoke-direct {v0}, Ljava/lang/Object;-><init>()V

    sput-object v0, Lbluconnect/j2h;->a:Lbluconnect/j2h;

    return-void
.end method

.method public constructor <init>()V
    .locals 0

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    return-void
.end method


# virtual methods
.method public final a(IZ)Lbluconnect/di7;
    .locals 2
    .annotation build Lbluconnect/ejh;
    .end annotation

    invoke-static {p1}, Lbluconnect/ii7;->l(I)D

    move-result-wide p0

    double-to-int p0, p0

    if-eqz p2, :cond_1

    int-to-double p0, p0

    const-wide v0, 0x400a3f7ced916873L    # 3.281

    mul-double/2addr v0, p0

    double-to-int p2, v0

    const/16 v0, 0x226

    if-le p2, v0, :cond_0

    const-wide v0, 0x3f445c7079626fb0L    # 6.21371192E-4

    mul-double/2addr p0, v0

    const/16 p2, 0xa

    int-to-double v0, p2

    mul-double/2addr p0, v0

    double-to-int p0, p0

    const/4 p1, 0x3

    goto :goto_0

    :cond_0
    const/4 p1, 0x4

    move p0, p2

    goto :goto_0

    :cond_1
    const/16 p1, 0x3e7

    if-le p0, p1, :cond_2

    div-int/lit8 p0, p0, 0x64

    const/4 p1, 0x2

    goto :goto_0

    :cond_2
    const/4 p1, 0x1

    :goto_0
    new-instance p2, Lbluconnect/di7;

    invoke-direct {p2, p0, p1}, Lbluconnect/di7;-><init>(II)V

    return-object p2
.end method

.method public final b(Z)I
    .locals 0

    if-eqz p1, :cond_0

    const/16 p0, 0xa

    return p0

    :cond_0
    const/4 p0, 0x1

    return p0
.end method

.method public final c(Z)I
    .locals 0

    if-eqz p1, :cond_0

    const/16 p0, 0x14

    return p0

    :cond_0
    const/4 p0, 0x2

    return p0
.end method

.method public final d(Landroid/content/Context;IZ)Lbluconnect/ys8;
    .locals 8
    .param p1    # Landroid/content/Context;
        .annotation build Lbluconnect/ejh;
        .end annotation
    .end param
    .annotation build Lbluconnect/ejh;
    .end annotation

    const-string v0, "context"

    invoke-static {p1, v0}, Lkotlin/jvm/internal/Intrinsics;->p(Ljava/lang/Object;Ljava/lang/String;)V

    if-eqz p3, :cond_0

    const/16 v0, 0x1e

    goto :goto_0

    :cond_0
    const/4 v0, 0x0

    :goto_0
    invoke-static {}, Ljava/util/Calendar;->getInstance()Ljava/util/Calendar;

    move-result-object v1

    invoke-virtual {v1}, Ljava/util/Calendar;->getTime()Ljava/util/Date;

    move-result-object v2

    invoke-virtual {v2}, Ljava/util/Date;->getTime()J

    move-result-wide v3

    sget-object v5, Ljava/util/concurrent/TimeUnit;->SECONDS:Ljava/util/concurrent/TimeUnit;

    int-to-long v6, p2

    invoke-virtual {v5, v6, v7}, Ljava/util/concurrent/TimeUnit;->toMillis(J)J

    move-result-wide v5

    add-long/2addr v5, v3

    invoke-virtual {v2, v5, v6}, Ljava/util/Date;->setTime(J)V

    invoke-virtual {v1, v2}, Ljava/util/Calendar;->setTime(Ljava/util/Date;)V

    const/16 p2, 0xb

    invoke-virtual {v1, p2}, Ljava/util/Calendar;->get(I)I

    move-result p2

    const/16 v2, 0xc

    invoke-virtual {v1, v2}, Ljava/util/Calendar;->get(I)I

    move-result v1

    invoke-virtual {p1}, Landroid/content/Context;->getApplicationContext()Landroid/content/Context;

    move-result-object p1

    invoke-static {p1}, Landroid/text/format/DateFormat;->is24HourFormat(Landroid/content/Context;)Z

    move-result p1

    if-eqz p1, :cond_1

    new-instance p0, Lbluconnect/ys8;

    invoke-direct {p0, p2, v1, v0}, Lbluconnect/ys8;-><init>(III)V

    return-object p0

    :cond_1
    invoke-virtual {p0, p2, v1, p3}, Lbluconnect/j2h;->e(IIZ)Lbluconnect/ys8;

    move-result-object p0

    return-object p0
.end method

.method public final e(IIZ)Lbluconnect/ys8;
    .locals 1
    .annotation build Lbluconnect/ejh;
    .end annotation

    const/16 v0, 0xc

    if-nez p1, :cond_0

    invoke-virtual {p0, p3}, Lbluconnect/j2h;->b(Z)I

    move-result p0

    move p1, v0

    goto :goto_0

    :cond_0
    if-ge p1, v0, :cond_1

    invoke-virtual {p0, p3}, Lbluconnect/j2h;->b(Z)I

    move-result p0

    goto :goto_0

    :cond_1
    if-ne p1, v0, :cond_2

    invoke-virtual {p0, p3}, Lbluconnect/j2h;->c(Z)I

    move-result p0

    goto :goto_0

    :cond_2
    add-int/lit8 p1, p1, -0xc

    invoke-virtual {p0, p3}, Lbluconnect/j2h;->c(Z)I

    move-result p0

    :goto_0
    new-instance p3, Lbluconnect/ys8;

    invoke-direct {p3, p1, p2, p0}, Lbluconnect/ys8;-><init>(III)V

    return-object p3
.end method

.method public final f(I)Lbluconnect/cal;
    .locals 3
    .annotation build Lbluconnect/ejh;
    .end annotation

    const p0, 0x15180

    div-int v0, p1, p0

    rem-int/2addr p1, p0

    div-int/lit16 p0, p1, 0xe10

    rem-int/lit16 p1, p1, 0xe10

    div-int/lit8 p1, p1, 0x3c

    if-lez v0, :cond_0

    const/16 v1, 0x1e

    goto :goto_0

    :cond_0
    const/4 v1, 0x1

    if-gt v1, p0, :cond_1

    const/16 v1, 0x18

    if-ge p0, v1, :cond_1

    const/16 v1, 0xa

    goto :goto_0

    :cond_1
    const/16 v1, 0x14

    :goto_0
    new-instance v2, Lbluconnect/cal;

    invoke-direct {v2, p0, p1, v0, v1}, Lbluconnect/cal;-><init>(IIII)V

    return-object v2
.end method

.method public final g(Lbluconnect/beo;)I
    .locals 0
    .param p1    # Lbluconnect/beo;
        .annotation build Lbluconnect/ejh;
        .end annotation
    .end param

    const-string p0, "stepInfo"

    invoke-static {p1, p0}, Lkotlin/jvm/internal/Intrinsics;->p(Ljava/lang/Object;Ljava/lang/String;)V

    sget-object p0, Lbluconnect/zkf;->a:Lbluconnect/zkf;

    invoke-virtual {p0, p1}, Lbluconnect/zkf;->b(Lbluconnect/beo;)Ljava/lang/String;

    move-result-object p0

    if-eqz p0, :cond_0

    invoke-static {p0}, Lbluconnect/s4p;->valueOf(Ljava/lang/String;)Lbluconnect/s4p;

    move-result-object p0

    iget p0, p0, Lbluconnect/s4p;->v2:I

    return p0

    :cond_0
    const/4 p0, -0x1

    return p0
.end method
