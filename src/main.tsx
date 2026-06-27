import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, theme } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import 'antd/dist/reset.css';
import './styles/global.css';

const routerBasename =
  import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#3cac3b',
          colorInfo: '#2a398d',
          colorError: '#e61d25',
          colorBgBase: '#181b1f',
          colorBgContainer: 'rgba(27, 31, 36, 0.88)',
          colorBorder: 'rgba(209, 212, 209, 0.18)',
          colorTextBase: '#f1f3f1',
          borderRadius: 16,
          fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
        components: {
          Button: {
            borderRadius: 16,
            fontWeight: 700,
          },
          Card: {
            colorBgContainer: 'rgba(209, 212, 209, 0.045)',
          },
          Form: {
            labelColor: '#f1f3f1',
          },
          Menu: {
            darkItemBg: 'transparent',
            darkSubMenuItemBg: 'transparent',
            itemBorderRadius: 14,
          },
        },
      }}
    >
      <BrowserRouter basename={routerBasename}>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>,
);
