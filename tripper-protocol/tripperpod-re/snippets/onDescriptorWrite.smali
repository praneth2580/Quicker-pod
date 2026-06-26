.method public onDescriptorWrite(Landroid/bluetooth/BluetoothGatt;Landroid/bluetooth/BluetoothGattDescriptor;I)V
    .locals 1

    const-string v0, "g"

    invoke-static {p1, v0}, Lkotlin/jvm/internal/Intrinsics;->f(Ljava/lang/Object;Ljava/lang/String;)V

    const-string p1, "d"

    invoke-static {p2, p1}, Lkotlin/jvm/internal/Intrinsics;->f(Ljava/lang/Object;Ljava/lang/String;)V

    iget-object p1, p0, Lcom/supertripper/app/TripperBleManager$gattCallback$1;->this$0:Lcom/supertripper/app/TripperBleManager;

    const-string p2, "onDescriptorWrite status="

    invoke-static {p3, p2}, Lcom/google/android/libraries/navigation/internal/xz/A;->h(ILjava/lang/String;)Ljava/lang/String;

    move-result-object p2

    if-nez p3, :cond_0

    sget-object p3, Lcom/supertripper/app/TripperBleManager$LogLevel;->OK:Lcom/supertripper/app/TripperBleManager$LogLevel;

    goto :goto_0

    :cond_0
    sget-object p3, Lcom/supertripper/app/TripperBleManager$LogLevel;->WARN:Lcom/supertripper/app/TripperBleManager$LogLevel;

    :goto_0
    invoke-static {p1, p2, p3}, Lcom/supertripper/app/TripperBleManager;->access$logMsg(Lcom/supertripper/app/TripperBleManager;Ljava/lang/String;Lcom/supertripper/app/TripperBleManager$LogLevel;)V

    return-void
.end method
