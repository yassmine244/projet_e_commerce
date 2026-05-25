import { Link } from 'react-router-dom';
import {
  FaBoxOpen,
  FaTags,
  FaClipboardList,
  FaUsers,
} from 'react-icons/fa';

const tiles = [
  {
    to: '/admin/products',
    label: 'Products',
    desc: 'Create, edit and remove products',
    icon: <FaBoxOpen />,
  },
  {
    to: '/admin/categories',
    label: 'Categories',
    desc: 'Manage product categories',
    icon: <FaTags />,
  },
  {
    to: '/admin/orders',
    label: 'Orders',
    desc: 'View and fulfill customer orders',
    icon: <FaClipboardList />,
  },
  {
    to: '/admin/users',
    label: 'Users',
    desc: 'Manage accounts and roles',
    icon: <FaUsers />,
  },
];

const DashboardPage = () => {
  return (
    <section className="admin">
      <header className="admin__header">
        <h1>Admin Dashboard</h1>
        <p className="admin__subtitle">Manage your store</p>
      </header>

      <div className="admin__tiles">
        {tiles.map((t) => (
          <Link key={t.to} to={t.to} className="admin__tile">
            <span className="admin__tileIcon">{t.icon}</span>
            <span className="admin__tileBody">
              <span className="admin__tileLabel">{t.label}</span>
              <span className="admin__tileDesc">{t.desc}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default DashboardPage;
