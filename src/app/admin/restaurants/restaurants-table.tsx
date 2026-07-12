"use client";

import { useState } from "react";
import Link from "next/link";
import type { Restaurant } from "@/lib/types/database";
import {
  createRestaurant,
  deleteRestaurant,
  updateRestaurantSubdomain,
} from "@/app/actions/super-admin";
import {
  createOrUpdateOwnerCredentials,
  updateOwnerPassword,
} from "@/app/actions/owner-credentials";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon, Trash2Icon, UserPlusIcon, KeyRoundIcon } from "lucide-react";

type RestaurantsTableProps = {
  initialRestaurants: Restaurant[];
  ownerUsernames: Record<string, string | null>;
};

export function RestaurantsTable({
  initialRestaurants,
  ownerUsernames: initialOwnerUsernames,
}: RestaurantsTableProps) {
  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [ownerUsernames, setOwnerUsernames] = useState(initialOwnerUsernames);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [status, setStatus] = useState<"active" | "suspended" | "trial">("active");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [ownerDialogRestaurant, setOwnerDialogRestaurant] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [ownerUsername, setOwnerUsername] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [ownerPasswordConfirm, setOwnerPasswordConfirm] = useState("");
  const [ownerSubmitError, setOwnerSubmitError] = useState<string | null>(null);
  const [ownerLoading, setOwnerLoading] = useState(false);

  const [passwordDialogRestaurant, setPasswordDialogRestaurant] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [passwordSubmitError, setPasswordSubmitError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [subdomainDialogRestaurant, setSubdomainDialogRestaurant] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [newSubdomain, setNewSubdomain] = useState("");
  const [subdomainSubmitError, setSubdomainSubmitError] = useState<string | null>(null);
  const [subdomainLoading, setSubdomainLoading] = useState(false);

  async function handleCreate() {
    setError(null);
    setLoading(true);
    const result = await createRestaurant({ name: name.trim(), subdomain: subdomain.trim(), status });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.data) {
      setRestaurants((prev) => [...prev, result.data!]);
      setName("");
      setSubdomain("");
      setStatus("active");
      setOpen(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`löschen Das Restaurant "${name}"? A Y kann A zurückgeben.`)) return;
    const result = await deleteRestaurant(id);
    if (!result.error) setRestaurants((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleCreateOwner() {
    if (!ownerDialogRestaurant) return;
    setOwnerSubmitError(null);
    if (ownerPassword !== ownerPasswordConfirm) {
      setOwnerSubmitError("Passwort stimmt nicht überein");
      return;
    }
    setOwnerLoading(true);
    const result = await createOrUpdateOwnerCredentials(
      ownerDialogRestaurant.id,
      ownerUsername,
      ownerPassword
    );
    setOwnerLoading(false);
    if (result.error) {
      setOwnerSubmitError(result.error);
      return;
    }
    setOwnerUsernames((prev) => ({ ...prev, [ownerDialogRestaurant.id]: ownerUsername.trim().toLowerCase() }));
    setOwnerDialogRestaurant(null);
    setOwnerUsername("");
    setOwnerPassword("");
    setOwnerPasswordConfirm("");
  }

  async function handleChangePassword() {
    if (!passwordDialogRestaurant) return;
    setPasswordSubmitError(null);
    if (newPassword !== newPasswordConfirm) {
      setPasswordSubmitError("Passwort stimmt nicht überein");
      return;
    }
    setPasswordLoading(true);
    const result = await updateOwnerPassword(passwordDialogRestaurant.id, newPassword);
    setPasswordLoading(false);
    if (result.error) {
      setPasswordSubmitError(result.error);
      return;
    }
    setPasswordDialogRestaurant(null);
    setNewPassword("");
    setNewPasswordConfirm("");
  }

  async function handleChangeSubdomain() {
    if (!subdomainDialogRestaurant) return;
    setSubdomainSubmitError(null);
    setSubdomainLoading(true);

    const result = await updateRestaurantSubdomain(subdomainDialogRestaurant.id, newSubdomain);

    setSubdomainLoading(false);
    if (result.error) {
      setSubdomainSubmitError(result.error);
      return;
    }

    const normalized = newSubdomain.trim().toLowerCase().replace(/\s+/g, "-");
    setRestaurants((prev) =>
      prev.map((r) => (r.id === subdomainDialogRestaurant.id ? { ...r, subdomain: normalized } : r))
    );

    setSubdomainDialogRestaurant(null);
    setNewSubdomain("");
  }

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Alle Restaurants</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
            <PlusIcon className="size-4" />
            Füge ein neues Restaurant hinzu
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Füge ein Restaurant hinzu</DialogTitle>
              <DialogDescription>
                Füge ein neues Restaurant hinzu. Du können einen Eigentümer später über die Dateivervollständigungsseite oder über die Datenbank verknüpfen.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <div className="grid gap-2">
                <Label htmlFor="name">der Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Beispiel: Al Baraka Restaurant"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subdomain">Subdomain</Label>
                <Input
                  id="subdomain"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  placeholder="Beispiel: Albaraka"
                />
                <p className="text-xs text-muted-foreground">
                  Das Menü erscheint für Kunden unter: {subdomain || "subdomain"}.yourdomain.com
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">der Zustand</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "active" | "suspended" | "trial")}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="active">aktiv</option>
                  <option value="trial">Experimental-</option>
                  <option value="suspended">Ausgesetzt</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Stornierung
              </Button>
              <Button onClick={handleCreate} disabled={loading || !name.trim() || !subdomain.trim()}>
                {loading ? "Hinzufügen..." : "Zusatz"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>der Name</TableHead>
              <TableHead>Subdomain</TableHead>
              <TableHead>der Zustand</TableHead>
              <TableHead>Benutzer anmelden</TableHead>
              <TableHead className="w-[140px]">Verfahren</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {restaurants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Es gibt noch keine Restaurants. Füge eine von oben hinzu.
                </TableCell>
              </TableRow>
            ) : (
              restaurants.map((r) => {
                const username = ownerUsernames[r.id] ?? null;
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{r.subdomain}</code>
                    </TableCell>
                    <TableCell>
                      <span>{r.status === "active" ? "aktiv" : r.status === "trial" ? "Experimental-" : "Ausgesetzt"}</span>
                    </TableCell>
                    <TableCell>
                      {username ? (
                        <span className="text-muted-foreground">{username}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Dialog
                          open={ownerDialogRestaurant?.id === r.id}
                          onOpenChange={(open) => {
                            if (!open) {
                              setOwnerDialogRestaurant(null);
                              setOwnerSubmitError(null);
                            } else {
                              setOwnerDialogRestaurant({ id: r.id, name: r.name });
                              setOwnerUsername(ownerUsernames[r.id] ?? "");
                              setOwnerPassword("");
                              setOwnerPasswordConfirm("");
                            }
                          }}
                        >
                          <DialogTrigger className="inline-flex h-8 items-center gap-1 rounded-md px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                            <UserPlusIcon className="size-4" />
                            {username ? "Änderung" : "Erstelle einen Benutzer"}
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>
                                {username ? "Anmeldebenutzer ändern" : "Erstelle einen Login-Benutzer"}
                              </DialogTitle>
                              <DialogDescription>
                                {username
                                  ? `Änderung Benutzername A und Passwort Thief Ein Restaurantbesitzer"${r.name}".`
                                  : `Konstruktion Ein Benutzername und ein Passwort. Ein Dieb, der ein Restaurant liebt"${r.name}". Du können sich von einer Das Restaurant-Domäne aus (z. B. ${r.subdomain}.localhost) mit Benutzername und Passwort anmelden.`}
                              </DialogDescription>
                            </DialogHeader>
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleCreateOwner();
                              }}
                              className="contents"
                            >
                              <div className="grid gap-4 py-4">
                                {ownerSubmitError && (
                                  <p className="text-sm text-destructive">{ownerSubmitError}</p>
                                )}
                                <div className="grid gap-2">
                                  <Label htmlFor="owner-username">Benutzername</Label>
                                  <Input
                                    id="owner-username"
                                    value={ownerUsername}
                                    onChange={(e) => setOwnerUsername(e.target.value)}
                                    placeholder="Beispiel: Administrator"
                                    dir="ltr"
                                    className="font-mono"
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="owner-password">
                                    {username ? "Neues Passwort (zum Behalten leer lassen)" : "Passwort"}
                                  </Label>
                                  <Input
                                    id="owner-password"
                                    type="password"
                                    value={ownerPassword}
                                    onChange={(e) => setOwnerPassword(e.target.value)}
                                    placeholder="••••••••"
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="owner-password-confirm">Passwort bestätigen</Label>
                                  <Input
                                    id="owner-password-confirm"
                                    type="password"
                                    value={ownerPasswordConfirm}
                                    onChange={(e) => setOwnerPasswordConfirm(e.target.value)}
                                    placeholder="••••••••"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setOwnerDialogRestaurant(null)}
                                >
                                  Stornierung
                                </Button>
                                <Button
                                  type="submit"
                                  disabled={
                                    ownerLoading ||
                                    !ownerUsername.trim() ||
                                    (!username && (!ownerPassword || ownerPassword !== ownerPasswordConfirm)) ||
                                    (ownerPassword.length > 0 && ownerPassword !== ownerPasswordConfirm)
                                  }
                                >
                                  {ownerLoading ? "Sparen..." : username ? "speichern" : "Konstruktion"}
                                </Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                        {username && (
                          <Dialog
                            open={passwordDialogRestaurant?.id === r.id}
                            onOpenChange={(open) => {
                              if (!open) setPasswordDialogRestaurant(null);
                              else setPasswordDialogRestaurant({ id: r.id, name: r.name });
                            }}
                          >
                            <DialogTrigger className="inline-flex h-8 items-center gap-1 rounded-md px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                              <KeyRoundIcon className="size-4" />
                              Kennwort ändern
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Kennwort ändern</DialogTitle>
                                <DialogDescription>
                                  Lege ein neues Passwort für einen Restaurantbesitzer fest{r.name}" (Benutzer: {username}).
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                {passwordSubmitError && (
                                  <p className="text-sm text-destructive">{passwordSubmitError}</p>
                                )}
                                <div className="grid gap-2">
                                  <Label htmlFor="new-password">Neues Passwort</Label>
                                  <Input
                                    id="new-password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="new-password-confirm">Passwort bestätigen</Label>
                                  <Input
                                    id="new-password-confirm"
                                    type="password"
                                    value={newPasswordConfirm}
                                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                                    placeholder="••••••••"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setPasswordDialogRestaurant(null)}
                                >
                                  Stornierung
                                </Button>
                                <Button
                                  onClick={handleChangePassword}
                                  disabled={
                                    passwordLoading ||
                                    !newPassword ||
                                    newPassword.length < 6 ||
                                    newPassword !== newPasswordConfirm
                                  }
                                >
                                  {passwordLoading ? "Sparen..." : "speichern"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                        <Link href={`/menu/${r.subdomain}`} target="_blank" rel="noreferrer">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-[12px] font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]"
                          >
                            Allgemeines Menü
                          </Button>
                        </Link>
                        <Dialog
                          open={subdomainDialogRestaurant?.id === r.id}
                          onOpenChange={(open) => {
                            if (!open) {
                              setSubdomainDialogRestaurant(null);
                              setSubdomainSubmitError(null);
                              return;
                            }
                            setSubdomainDialogRestaurant({ id: r.id, name: r.name });
                            setNewSubdomain(r.subdomain ?? "");
                            setSubdomainSubmitError(null);
                          }}
                        >
                          <DialogTrigger className="inline-flex h-8 items-center gap-1 rounded-md px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                            Umfang bearbeiten
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Subdomain bearbeiten</DialogTitle>
                              <DialogDescription>
                                Lege eine neue Domain für das Restaurant fest{r.name}". Dies wirkt sich auf den allgemeinen Menülink aus.
                              </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                              {subdomainSubmitError && (
                                <p className="text-sm text-destructive">{subdomainSubmitError}</p>
                              )}
                              <div className="grid gap-2">
                                <Label htmlFor="new-subdomain">Neue Subdomain</Label>
                                <Input
                                  id="new-subdomain"
                                  value={newSubdomain}
                                  onChange={(e) =>
                                    setNewSubdomain(
                                      e.target.value.toLowerCase().replace(/\s+/g, "-")
                                    )
                                  }
                                  placeholder="Beispiel: Albaraka"
                                  dir="ltr"
                                  className="font-mono"
                                />
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Die Speisekarte ist erhältlich unter: <code>{newSubdomain || r.subdomain}.localhost</code>
                              </p>
                            </div>

                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSubdomainDialogRestaurant(null);
                                }}
                              >
                                Stornierung
                              </Button>
                              <Button
                                onClick={handleChangeSubdomain}
                                disabled={
                                  subdomainLoading || !newSubdomain.trim() || newSubdomain.trim() === r.subdomain
                                }
                              >
                                {subdomainLoading ? "Sparen..." : "speichern"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(r.id, r.name)}
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
