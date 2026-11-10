import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { router } from '@inertiajs/react';

export default function ObservacoesGeraisModal({ open, selected, form, setForm, errors = {}, onClose }) {
    if (!selected) return null;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Observações Gerais — Nº {selected.num_processo}</DialogTitle>
                </DialogHeader>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();

                        router.put(
                            `/waiting-lists/${selected.id}/observacoes-gerais`,
                            {
                                observacoes_secretaria: form.observacoes_secretaria,
                            },
                            {
                                preserveScroll: true,
                                onSuccess: () => onClose(),
                            },
                        );
                    }}
                    className="space-y-4"
                >
                    <div className="grid gap-2">
                        <Label>Observações gerais</Label>
                        <Textarea
                            value={form.observacoes_secretaria}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    observacoes_secretaria: e.target.value,
                                })
                            }
                            className="h-32"
                        />
                        {errors.observacoes_secretaria && <p className="text-destructive text-sm">{errors.observacoes_secretaria}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit">Guardar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
