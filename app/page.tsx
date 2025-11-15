import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect a dashboard por defecto
  redirect('/portals');
}

