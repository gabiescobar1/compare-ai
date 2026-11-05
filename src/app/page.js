import { OWNER_MODE } from '@/constants/FeatureFlags';
import HomeClient from '@/components/HomeClient';

// A home é pública. O formulário de geração só é montado com o MODO AUTORA
// ligado — e quem decide é o servidor, aqui; o cliente só recebe o booleano.
export default function Home() {
  return <HomeClient canGenerate={OWNER_MODE} />;
}
