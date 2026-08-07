import { Home, Calendar, Users, BookOpen, Lock } from "lucide-react"

export const navItems = [
  { label: "Beranda",   href: "/",           icon: Home },
  { label: "Timeline",  href: "/#timeline",  icon: Calendar },
  { label: "Kandidat",  href: "/#kandidat",  icon: Users },
	{ label: "Informasi", href: "/#informasi", icon: BookOpen },
	{ label: "Cek Peserta", href: "/peserta", icon: Users },
	{ label: "Admin",     href: "/admin/login", icon: Lock },
]
