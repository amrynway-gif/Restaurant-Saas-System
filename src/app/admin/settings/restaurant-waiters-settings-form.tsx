"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { RestaurantWaiter } from "@/lib/types/database";
import {
  createRestaurantWaiter,
  deleteRestaurantWaiter,
  setWaitersSystemEnabled,
  updateRestaurantWaiterName,
} from "@/app/actions/waiters";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";

type Props = {
  restaurantId: string;
  initialEnabled: boolean;
  initialWaiters: RestaurantWaiter[];
};

export function RestaurantWaitersSettingsForm({
  restaurantId: _restaurantId,
  initialEnabled,
  initialWaiters,
}: Props) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [waiters, setWaiters] = useState(initialWaiters);
  const [newName, setNewName] = useState("");
  const [loadingToggle, setLoadingToggle] = useState(false);
  const [adding, setAdding] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setWaiters(initialWaiters);
  }, [initialWaiters]);

  useEffect(() => {
    setEnabled(initialEnabled);
  }, [initialEnabled]);

  async function handleToggle(next: boolean) {
    setLoadingToggle(true);
    const res = await setWaitersSystemEnabled(next);
    setLoadingToggle(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    setEnabled(next);
    toast.success(next ? "Das Kellnersystem wurde aktiviert." : "Das Kellnersystem wurde gestoppt.");
    router.refresh();
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const t = newName.trim();
    if (!t) return;
    setAdding(true);
    const res = await createRestaurantWaiter(t);
    setAdding(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    setNewName("");
    if (res.id) {
      setWaiters((prev) => [
        ...prev,
        {
          id: res.id!,
          restaurant_id: _restaurantId,
          name: t,
          sort_order: prev.length + 1,
        },
      ]);
    }
    toast.success("Das Twitter wurde hinzugefügt.");
    router.refresh();
  }

  async function saveName(waiter: RestaurantWaiter, name: string) {
    const t = name.trim();
    if (!t || t === waiter.name) return;
    setSavingId(waiter.id);
    const res = await updateRestaurantWaiterName(waiter.id, t);
    setSavingId(null);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    setWaiters((prev) => prev.map((w) => (w.id === waiter.id ? { ...w, name: t } : w)));
    toast.success("Name gespeichert.");
    router.refresh();
  }

  async function remove(waiterId: string) {
    if (!confirm("Dieses Twitter löschen? Die Verknüpfung mit den Tabellen wird aufgehoben.")) return;
    setDeletingId(waiterId);
    const res = await deleteRestaurantWaiter(waiterId);
    setDeletingId(null);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    setWaiters((prev) => prev.filter((w) => w.id !== waiterId));
    toast.success("Gelöscht.");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-lg border border-border/80 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Label htmlFor="waiters-system" className="text-base font-medium">
            Aktiviere das Witters-System
          </Label>
          <p className="text-sm text-muted-foreground">
            Bei der Aktivierung könne die Kellner benennen, jeden Tisch einem Kellner zuordnen und den Namen des Administrators in den Anfragen anzeigen
Filterung nach Tabelle oder Wasser.
          </p>
        </div>
        <Switch
          id="waiters-system"
          checked={enabled}
          disabled={loadingToggle}
          onCheckedChange={(v) => void handleToggle(v)}
        />
      </div>

      {enabled ? (
        <div className="space-y-4">
          <p className="text-sm font-medium">Twitter-Namen</p>
          <form onSubmit={handleAdd} className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="new-waiter-name">Twitter hinzufügen</Label>
              <Input
                id="new-waiter-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Beispiel: Ahmed"
                dir="auto"
              />
            </div>
            <Button type="submit" disabled={adding || !newName.trim()}>
              {adding ? "Hinzufügen..." : "Zusatz"}
            </Button>
          </form>

          {waiters.length === 0 ? (
            <p className="text-sm text-muted-foreground">Noch keine Namen hinzugefügt. Witra oben hinzufügen.</p>
          ) : (
            <ul className="space-y-2">
              {waiters.map((w) => (
                <li
                  key={w.id}
                  className="flex flex-col gap-2 rounded-lg border border-border/60 bg-background/50 p-3 sm:flex-row sm:items-center"
                >
                  <Input
                    defaultValue={w.name}
                    key={w.id}
                    className="flex-1"
                    dir="auto"
                    disabled={savingId === w.id || deletingId === w.id}
                    onBlur={(e) => void saveName(w, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-destructive hover:text-destructive"
                    disabled={deletingId === w.id}
                    onClick={() => void remove(w.id)}
                    aria-label="löschen"
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <p className="text-xs text-muted-foreground">
            Verknüpfe jede Tabelle mit einer Twitter-Seite{" "}
            <span className="font-medium text-foreground">Tabellen und QR-Codes</span> Nachdem du die Namen hier gespeichert haben.
          </p>
        </div>
      ) : null}
    </div>
  );
}
