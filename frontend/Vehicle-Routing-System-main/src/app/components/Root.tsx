import { Outlet } from 'react-router';

export function Root() {
  return (
    <div className="size-full bg-slate-50">
      <Outlet />
    </div>
  );
}
