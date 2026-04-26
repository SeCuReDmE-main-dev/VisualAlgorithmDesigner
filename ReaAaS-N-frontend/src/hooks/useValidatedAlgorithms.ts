import { useCallback, useEffect, useState } from 'react';
import {
  deleteValidatedAlgorithm,
  listValidatedAlgorithms,
  promoteValidatedAlgorithm,
  updateValidatedAlgorithm,
  type PromoteValidatedAlgorithmInput,
  type ValidatedAlgorithmRecord,
} from '../services/validatedAlgorithmCatalog';

export function useValidatedAlgorithms() {
  const [algorithms, setAlgorithms] = useState<ValidatedAlgorithmRecord[]>(() => listValidatedAlgorithms());

  const refresh = useCallback(() => {
    setAlgorithms(listValidatedAlgorithms());
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === 'vad_validated_algorithms') {
        refresh();
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refresh]);

  const promote = useCallback((input: PromoteValidatedAlgorithmInput) => {
    const record = promoteValidatedAlgorithm(input);
    refresh();
    return record;
  }, [refresh]);

  const update = useCallback((id: string, patch: Parameters<typeof updateValidatedAlgorithm>[1]) => {
    const record = updateValidatedAlgorithm(id, patch);
    refresh();
    return record;
  }, [refresh]);

  const remove = useCallback((id: string) => {
    const removed = deleteValidatedAlgorithm(id);
    refresh();
    return removed;
  }, [refresh]);

  return {
    algorithms,
    refresh,
    promote,
    update,
    remove,
  };
}
