.class public Lbluconnect/ri1;
.super Ljava/lang/Object;
.source "SourceFile"


# annotations
.annotation build Lcom/newrelic/agent/android/instrumentation/Instrumented;
.end annotation


# direct methods
.method public constructor <init>()V
    .locals 0

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    return-void
.end method

.method public static a(Landroid/content/Context;)Ljava/util/List;
    .locals 1
    .annotation system Ldalvik/annotation/MethodParameters;
        accessFlags = {
            0x0
        }
        names = {
            "context"
        }
    .end annotation

    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Landroid/content/Context;",
            ")",
            "Ljava/util/List<",
            "Lcom/royalenfield/bluetooth/ble/DeviceInfo;",
            ">;"
        }
    .end annotation

    invoke-static {}, Lbluconnect/ggk;->getInstance()Lbluconnect/ggk;

    move-result-object v0

    invoke-virtual {v0}, Lbluconnect/ggk;->getClusterDetailResponseFirestore()Lbluconnect/s05;

    move-result-object v0

    invoke-static {v0, p0}, Lbluconnect/ri1;->b(Lbluconnect/s05;Landroid/content/Context;)Ljava/util/List;

    move-result-object p0

    return-object p0
.end method

.method public static b(Lbluconnect/s05;Landroid/content/Context;)Ljava/util/List;
    .locals 20
    .annotation system Ldalvik/annotation/MethodParameters;
        accessFlags = {
            0x0,
            0x0
        }
        names = {
            "clusterDetailResponseFirestore",
            "context"
        }
    .end annotation

    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Lbluconnect/s05;",
            "Landroid/content/Context;",
            ")",
            "Ljava/util/List<",
            "Lcom/royalenfield/bluetooth/ble/DeviceInfo;",
            ">;"
        }
    .end annotation

    move-object/from16 v0, p0

    if-eqz v0, :cond_4

    iget-object v0, v0, Lbluconnect/s05;->b:Ljava/util/List;

    new-instance v1, Ljava/util/ArrayList;

    invoke-direct {v1}, Ljava/util/ArrayList;-><init>()V

    if-eqz v0, :cond_3

    invoke-interface {v0}, Ljava/util/List;->size()I

    move-result v2

    if-lez v2, :cond_3

    invoke-interface {v0}, Ljava/util/List;->iterator()Ljava/util/Iterator;

    move-result-object v0

    :cond_0
    :goto_0
    invoke-interface {v0}, Ljava/util/Iterator;->hasNext()Z

    move-result v2

    if-eqz v2, :cond_2

    invoke-interface {v0}, Ljava/util/Iterator;->next()Ljava/lang/Object;

    move-result-object v2

    check-cast v2, Lbluconnect/n0q;

    :try_start_0
    iget-object v3, v2, Lbluconnect/n0q;->g:Ljava/lang/String;

    if-eqz v3, :cond_1

    iget-object v3, v2, Lbluconnect/n0q;->c:Ljava/lang/String;

    if-eqz v3, :cond_1

    invoke-static/range {p1 .. p1}, Lbluconnect/mfk;->u(Landroid/content/Context;)Lbluconnect/mfk;

    move-result-object v4

    const-string v5, "RandomUUID"

    move-object/from16 v6, p1

    invoke-virtual {v4, v6, v5}, Lbluconnect/mfk;->c(Landroid/content/Context;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v4

    invoke-virtual {v3, v4}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v3

    if-eqz v3, :cond_0

    new-instance v7, Lcom/royalenfield/bluetooth/ble/DeviceInfo;

    iget-object v8, v2, Lbluconnect/n0q;->b:Ljava/lang/String;

    iget-object v9, v2, Lbluconnect/n0q;->a:Ljava/lang/String;

    iget-object v12, v2, Lbluconnect/n0q;->d:Ljava/lang/String;

    iget-object v13, v2, Lbluconnect/n0q;->g:Ljava/lang/String;

    iget-object v3, v2, Lbluconnect/n0q;->c:Ljava/lang/String;

    iget-object v4, v2, Lbluconnect/n0q;->f:Ljava/lang/String;

    iget-object v5, v2, Lbluconnect/n0q;->i:Ljava/lang/String;

    iget-object v2, v2, Lbluconnect/n0q;->e:Ljava/lang/String;

    const/4 v11, 0x0

    const/4 v10, 0x1

    const-wide/16 v14, 0x0

    move-object/from16 v19, v2

    move-object/from16 v16, v3

    move-object/from16 v17, v4

    move-object/from16 v18, v5

    invoke-direct/range {v7 .. v19}, Lcom/royalenfield/bluetooth/ble/DeviceInfo;-><init>(Ljava/lang/String;Ljava/lang/String;ZZLjava/lang/String;Ljava/lang/String;JLjava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V

    invoke-virtual {v1, v7}, Ljava/util/ArrayList;->add(Ljava/lang/Object;)Z
    :try_end_0
    .catch Lcom/royalenfield/reprime/preference/PreferenceException; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_0

    :cond_1
    move-object/from16 v6, p1

    goto :goto_0

    :catch_0
    move-exception v0

    invoke-virtual {v0}, Ljava/lang/Throwable;->printStackTrace()V

    new-instance v0, Ljava/util/ArrayList;

    invoke-direct {v0}, Ljava/util/ArrayList;-><init>()V

    return-object v0

    :cond_2
    return-object v1

    :cond_3
    new-instance v0, Ljava/util/ArrayList;

    invoke-direct {v0}, Ljava/util/ArrayList;-><init>()V

    return-object v0

    :cond_4
    new-instance v0, Ljava/util/ArrayList;

    invoke-direct {v0}, Ljava/util/ArrayList;-><init>()V

    return-object v0
.end method

.method public static c(Landroid/content/Context;)Z
    .locals 3
    .annotation system Ldalvik/annotation/MethodParameters;
        accessFlags = {
            0x0
        }
        names = {
            "context"
        }
    .end annotation

    const/4 v0, 0x1

    :try_start_0
    invoke-static {p0}, Lbluconnect/mfk;->u(Landroid/content/Context;)Lbluconnect/mfk;

    move-result-object v1

    const-string v2, "isAutoConnect"

    invoke-virtual {v1, p0, v2, v0}, Lbluconnect/mfk;->f(Landroid/content/Context;Ljava/lang/String;Z)Z

    move-result p0
    :try_end_0
    .catch Lcom/royalenfield/reprime/preference/PreferenceException; {:try_start_0 .. :try_end_0} :catch_0

    return p0

    :catch_0
    return v0
.end method

.method public static d(Ljava/lang/String;Landroid/content/Context;)Z
    .locals 3
    .annotation system Ldalvik/annotation/MethodParameters;
        accessFlags = {
            0x0,
            0x0
        }
        names = {
            "address",
            "context"
        }
    .end annotation

    invoke-static {p1}, Lbluconnect/ri1;->a(Landroid/content/Context;)Ljava/util/List;

    move-result-object p1

    check-cast p1, Ljava/util/ArrayList;

    invoke-virtual {p1}, Ljava/util/ArrayList;->size()I

    move-result v0

    const/4 v1, 0x0

    if-lez v0, :cond_1

    move v0, v1

    :goto_0
    invoke-virtual {p1}, Ljava/util/ArrayList;->size()I

    move-result v2

    if-ge v0, v2, :cond_1

    invoke-virtual {p1, v0}, Ljava/util/ArrayList;->get(I)Ljava/lang/Object;

    move-result-object v2

    check-cast v2, Lcom/royalenfield/bluetooth/ble/DeviceInfo;

    iget-object v2, v2, Lcom/royalenfield/bluetooth/ble/DeviceInfo;->A2:Ljava/lang/String;

    invoke-virtual {p0, v2}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v2

    if-eqz v2, :cond_0

    const/4 p0, 0x1

    return p0

    :cond_0
    add-int/lit8 v0, v0, 0x1

    goto :goto_0

    :cond_1
    return v1
.end method

.method public static e(Ljava/util/List;Landroid/content/Context;)V
    .locals 3
    .annotation system Ldalvik/annotation/MethodParameters;
        accessFlags = {
            0x0,
            0x0
        }
        names = {
            "list",
            "context"
        }
    .end annotation

    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Ljava/util/List<",
            "Lcom/royalenfield/bluetooth/ble/DeviceInfo;",
            ">;",
            "Landroid/content/Context;",
            ")V"
        }
    .end annotation

    const/4 v0, 0x0

    move v1, v0

    :goto_0
    invoke-interface {p0}, Ljava/util/List;->size()I

    move-result v2

    if-ge v1, v2, :cond_0

    invoke-interface {p0, v1}, Ljava/util/List;->get(I)Ljava/lang/Object;

    move-result-object v2

    check-cast v2, Lcom/royalenfield/bluetooth/ble/DeviceInfo;

    iput-boolean v0, v2, Lcom/royalenfield/bluetooth/ble/DeviceInfo;->y2:Z

    add-int/lit8 v1, v1, 0x1

    goto :goto_0

    :cond_0
    invoke-static {p0, p1}, Lbluconnect/ri1;->i(Ljava/util/List;Landroid/content/Context;)V

    return-void
.end method

.method public static f(Landroid/content/Context;Ljava/lang/String;Ljava/util/List;)V
    .locals 1
    .annotation system Ldalvik/annotation/MethodParameters;
        accessFlags = {
            0x0,
            0x0,
            0x0
        }
        names = {
            "context",
            "address",
            "mStoredDevicesList"
        }
    .end annotation

    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Landroid/content/Context;",
            "Ljava/lang/String;",
            "Ljava/util/List<",
            "Lcom/royalenfield/bluetooth/ble/DeviceInfo;",
            ">;)V"
        }
    .end annotation

    if-eqz p2, :cond_0

    invoke-interface {p2}, Ljava/util/List;->size()I

    move-result v0

    if-lez v0, :cond_0

    const/4 v0, 0x1

    invoke-static {p2, p1, v0}, Lbluconnect/ri1;->g(Ljava/util/List;Ljava/lang/String;Z)V

    invoke-static {p2, p0}, Lbluconnect/ri1;->i(Ljava/util/List;Landroid/content/Context;)V

    :cond_0
    return-void
.end method

.method public static g(Ljava/util/List;Ljava/lang/String;Z)V
    .locals 2
    .annotation system Ldalvik/annotation/MethodParameters;
        accessFlags = {
            0x0,
            0x0,
            0x0
        }
        names = {
            "mStoredDevicesList",
            "address",
            "b"
        }
    .end annotation

    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Ljava/util/List<",
            "Lcom/royalenfield/bluetooth/ble/DeviceInfo;",
            ">;",
            "Ljava/lang/String;",
            "Z)V"
        }
    .end annotation

    const/4 v0, 0x0

    :goto_0
    invoke-interface {p0}, Ljava/util/List;->size()I

    move-result v1

    if-ge v0, v1, :cond_1

    invoke-interface {p0, v0}, Ljava/util/List;->get(I)Ljava/lang/Object;

    move-result-object v1

    check-cast v1, Lcom/royalenfield/bluetooth/ble/DeviceInfo;

    iget-object v1, v1, Lcom/royalenfield/bluetooth/ble/DeviceInfo;->A2:Ljava/lang/String;

    invoke-virtual {p1, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v1

    if-eqz v1, :cond_0

    invoke-interface {p0, v0}, Ljava/util/List;->get(I)Ljava/lang/Object;

    move-result-object v1

    check-cast v1, Lcom/royalenfield/bluetooth/ble/DeviceInfo;

    iput-boolean p2, v1, Lcom/royalenfield/bluetooth/ble/DeviceInfo;->y2:Z

    :cond_0
    add-int/lit8 v0, v0, 0x1

    goto :goto_0

    :cond_1
    return-void
.end method

.method public static h(Landroid/content/Context;Ljava/lang/String;Ljava/util/List;)V
    .locals 1
    .annotation system Ldalvik/annotation/MethodParameters;
        accessFlags = {
            0x0,
            0x0,
            0x0
        }
        names = {
            "context",
            "address",
            "mStoredDevicesList"
        }
    .end annotation

    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Landroid/content/Context;",
            "Ljava/lang/String;",
            "Ljava/util/List<",
            "Lcom/royalenfield/bluetooth/ble/DeviceInfo;",
            ">;)V"
        }
    .end annotation

    if-eqz p2, :cond_0

    invoke-interface {p2}, Ljava/util/List;->size()I

    move-result v0

    if-lez v0, :cond_0

    const/4 v0, 0x0

    invoke-static {p2, p1, v0}, Lbluconnect/ri1;->g(Ljava/util/List;Ljava/lang/String;Z)V

    invoke-static {p2, p0}, Lbluconnect/ri1;->i(Ljava/util/List;Landroid/content/Context;)V

    :cond_0
    return-void
.end method

.method public static i(Ljava/util/List;Landroid/content/Context;)V
    .locals 3
    .annotation system Ldalvik/annotation/MethodParameters;
        accessFlags = {
            0x0,
            0x0
        }
        names = {
            "deviceInfoList",
            "context"
        }
    .end annotation

    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Ljava/util/List<",
            "Lcom/royalenfield/bluetooth/ble/DeviceInfo;",
            ">;",
            "Landroid/content/Context;",
            ")V"
        }
    .end annotation

    :try_start_0
    invoke-static {p1}, Lbluconnect/mfk;->u(Landroid/content/Context;)Lbluconnect/mfk;

    move-result-object v0

    const-string v1, "mytbtlist"

    new-instance v2, Lcom/google/gson/Gson;

    invoke-direct {v2}, Lcom/google/gson/Gson;-><init>()V

    invoke-static {v2, p0}, Lcom/newrelic/agent/android/instrumentation/GsonInstrumentation;->toJson(Lcom/google/gson/Gson;Ljava/lang/Object;)Ljava/lang/String;

    move-result-object p0

    invoke-virtual {v0, p1, v1, p0}, Lbluconnect/mfk;->m(Landroid/content/Context;Ljava/lang/String;Ljava/lang/String;)V
    :try_end_0
    .catch Lcom/royalenfield/reprime/preference/PreferenceException; {:try_start_0 .. :try_end_0} :catch_0

    :catch_0
    return-void
.end method
