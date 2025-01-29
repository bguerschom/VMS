import { useLocation, Link } from 'react-router-dom'

const Sidebar = () => {
  const location = useLocation()
  
  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Check In', path: '/check-in', icon: '➡️' },
    { name: 'Check Out', path: '/check-out', icon: '⬅️' },
    { name: 'Reports', path: '/reports', icon: '📈' },
  ]

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 h-screen fixed left-0 top-0 pt-16 shadow-sm">
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm rounded-lg ${
                  location.pathname === item.path
                    ? 'bg-black text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
