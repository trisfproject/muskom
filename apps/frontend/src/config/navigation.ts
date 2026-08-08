import { Home, Calendar, Users, BookOpen, Lock, IdCard } from "lucide-react"

export const navItems = [
  { label: "Beranda", href: "/", icon: Home },
  { label: "Timeline", href: "/#timeline", icon: Calendar },
  { label: "Kandidat", href: "/#kandidat", icon: Users },
  { label: "Informasi", href: "/#informasi", icon: BookOpen },
  { label: "Peserta", href: "/peserta", icon: IdCard },
  { label: "Admin", href: "/admin/login", icon: Lock },
]
