import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function SituacaoInternaModal({ open, onClose, doente, resultados }) {
    const [situacao, setSituacao] = useState('');

    useEffect(() => {
        if (doente) {
            setSituacao(doente.situacao_interna ?? '');
        }
    }, [doente]);

    function submit() {
        router.post(
            `/waiting-list/${doente.id}/situacao-interna`,
            {
                situacao_interna: situacao,
            },
            {
                onSuccess: onClose,
            },
        );
    }

    if (!doente) return null;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Alterar situação interna</DialogTitle>
                    <DialogDescription>{doente.nome}</DialogDescription>
                </DialogHeader>

                <div className="grid gap-2">
                    <Label>Situação interna</Label>
                    <Select value={situacao} onValueChange={setSituacao}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            {resultados.map((opt: string) => (
                                <SelectItem key={opt} value={opt}>
                                    {opt}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button onClick={submit}>Guardar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
