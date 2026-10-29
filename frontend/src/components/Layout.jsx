import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';
import '../styles/Layout.css';

export default function Layout({ title, children }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout__main">
        <TopBar title={title} />
        <main className="layout__content">{children}</main>
      </div>
    </div>
  );
}
