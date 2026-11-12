import { useLocation, useNavigate } from 'react-router-dom';
import { ErrorPage } from '@/components/blocks/system';
import { SignedOutPage } from '@/components/blocks/auth';

function Brand() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-lg bg-primary text-emph font-bold text-primary-foreground">
        C
      </span>
      <span className="leading-tight">
        <strong className="block text-emph font-bold text-foreground">CTXH</strong>
        <small className="block text-micro text-muted-foreground">Ngày công tác xã hội</small>
      </span>
    </span>
  );
}

export function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <ErrorPage
      status="404"
      path={location.pathname}
      onHome={() => navigate('/')}
      onBack={() => navigate(-1)}
    />
  );
}

export function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <ErrorPage
      status="403"
      onHome={() => navigate('/')}
      onBack={() => navigate(-1)}
      onSupport={() => navigate('/')}
    />
  );
}

export function ServerErrorPage() {
  const navigate = useNavigate();

  return (
    <ErrorPage
      status="500"
      onHome={() => navigate('/')}
      onBack={() => navigate(-1)}
      onRetry={() => window.location.reload()}
    />
  );
}

export function SignedOutRoute() {
  const navigate = useNavigate();

  return (
    <div className="h-full">
      <SignedOutPage
        brand={<Brand />}
        reason="signed-out"
        onLogin={() => navigate('/login', { replace: true })}
      />
    </div>
  );
}
