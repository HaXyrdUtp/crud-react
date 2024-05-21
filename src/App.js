import React, { useState, useEffect } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, Table, Input, Select, Space, Divider } from 'antd';
import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import './App.css';

const { Header, Sider, Content } = Layout;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedNav, setSelectedNav] = useState('1');
  const [clientes, setClientes] = useState([]);
  const [clienteNombre, setClienteNombre] = useState('');
  const [nombre, setNombre] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [mapa, setMapa] = useState('');
  const [estatus, setEstatus] = useState('');
  const [currentClienteId, setCurrentClienteId] = useState(null);

  useEffect(() => {
    const getClientes = async () => {
      const datos = await getDocs(collection(db, 'Proyectos'));
      setClientes(datos.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    };
    getClientes();
  }, []);

  const agregarCliente = async (e) => {
    e.preventDefault();
    if (!clienteNombre.trim() || !nombre.trim() || !ubicacion.trim() || !mapa.trim() || !estatus.trim()) {
      console.log('Todos los campos son obligatorios');
      return;
    }

    try {
      const nuevoCliente = {
        clienteNombre,
        nombre,
        ubicacion,
        mapa,
        estatus
      };
      const docRef = await addDoc(collection(db, 'Proyectos'), nuevoCliente);
      setClientes([...clientes, { ...nuevoCliente, id: docRef.id }]);
      setClienteNombre('');
      setNombre('');
      setUbicacion('');
      setMapa('');
      setEstatus('');
    } catch (error) {
      console.log(error);
    }
  };

  const editarCliente = (cliente) => {
    setClienteNombre(cliente.clienteNombre);
    setNombre(cliente.nombre);
    setUbicacion(cliente.ubicacion);
    setMapa(cliente.mapa);
    setEstatus(cliente.estatus);
    setCurrentClienteId(cliente.id);
    setSelectedNav('3'); // Switch to the 'nav 3' view
  };

  const actualizarCliente = async (e) => {
    e.preventDefault();
    if (!clienteNombre.trim() || !nombre.trim() || !ubicacion.trim() || !mapa.trim() || !estatus.trim()) {
      console.log('Todos los campos son obligatorios');
      return;
    }

    try {
      const clienteDoc = doc(db, 'Proyectos', currentClienteId);
      await updateDoc(clienteDoc, {
        clienteNombre,
        nombre,
        ubicacion,
        mapa,
        estatus
      });
      const datos = await getDocs(collection(db, 'Proyectos'));
      setClientes(datos.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      setClienteNombre('');
      setNombre('');
      setUbicacion('');
      setMapa('');
      setEstatus('');
      setCurrentClienteId(false);
      setSelectedNav('1'); // Switch back to the 'Clientes' view
    } catch (error) {
      console.log(error);
    }
  };

  const eliminarCliente = async (id) => {
    try {
      await deleteDoc(doc(db, 'Proyectos', id));
      const arrayFiltrado = clientes.filter(item => item.id !== id);
      setClientes(arrayFiltrado);
      setSelectedNav('3'); // Switch to the 'nav 3' view
    } catch (error) {
      console.log(error);
    }
  };

  const columns = [
    {
      title: 'Nombre del Cliente',
      dataIndex: 'clienteNombre',
      filters: clientes.map(cliente => ({
        text: cliente.clienteNombre,
        value: cliente.clienteNombre,
      })),
      onFilter: (value, record) => record.clienteNombre.indexOf(value) === 0,
    },
    {
      title: 'Nombre del Proyecto',
      dataIndex: 'nombre',
      sorter: (a, b) => a.nombre.length - b.nombre.length,
    },
    {
      title: 'Ubicación',
      dataIndex: 'ubicacion',
    },
    {
      title: 'Estatus del Proyecto',
      dataIndex: 'estatus',
      onFilter: (value, record) => record.estatus === value,
    },
    {
      title: 'Acciones',
      dataIndex: 'acciones',
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => editarCliente(record)}>Editar</Button>
          <Button type="link" onClick={() => eliminarCliente(record.id)}>Eliminar</Button>
        </>
      ),
    },
  ];

  const onChange = (pagination, filters, sorter, extra) => {
    console.log('params', pagination, filters, sorter, extra);
  };

  const renderContent = () => {
    switch (selectedNav) {
      case '1':
        return (
          <>
            <Divider orientation="left" style={{ fontSize: 25 }}>Clientes</Divider>
            <Table
              columns={columns}
              dataSource={clientes.map(cliente => ({ ...cliente, key: cliente.id }))}
              onChange={onChange}
              pagination={{ pageSize: 5 }}
            />
          </>
        );
      case '2':
        return (
          <>
            <Divider orientation="left" style={{ fontSize: 25 }}>
              {currentClienteId ? 'Editar Cliente' : 'Agregar Cliente'}
            </Divider>
            <form onSubmit={currentClienteId ? actualizarCliente : agregarCliente}>
              <Space size="middle" direction="vertical" style={{ width: '100%' }}>
                <Input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Ingrese el cliente"
                  value={clienteNombre}
                  onChange={e => setClienteNombre(e.target.value)}
                />
                <Input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Ingrese el nombre"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                />
                <Input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Ingrese la ubicación"
                  value={ubicacion}
                  onChange={e => setUbicacion(e.target.value)}
                />
                <Input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Ingrese el mapa"
                  value={mapa}
                  onChange={e => setMapa(e.target.value)}
                />
                <Select
                  className="form-control mb-2"
                  defaultValue="Estatus"
                  onChange={e => setEstatus(e)}
                  options={[
                    { value: 'En curso', label: 'En curso' },
                    { value: 'Stand By', label: 'Stand By' },
                    { value: 'Terminado', label: 'Terminado' }
                  ]}
                />
                <Button type="primary" htmlType="submit" className="btn btn-primary btn-block">
                  {currentClienteId ? 'Editar' : 'Agregar'}
                </Button>
              </Space>
            </form>
          </>
        );
      case '3':
        return (
          <>
            <Divider orientation="left" style={{ fontSize: 25 }}>Información del Cliente</Divider>
            <p>Nombre del Cliente: {clienteNombre}</p>
            <p>Nombre del Proyecto: {nombre}</p>
            <p>Ubicación: {ubicacion}</p>
            <p>Mapa: {mapa}</p>
            <p>Estatus: {estatus}</p>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          onClick={({ key }) => setSelectedNav(key)}
          items={[
            {
              key: '1',
              icon: <UserOutlined />,
              label: 'Clientes',
            },
            {
              key: '2',
              icon: <VideoCameraOutlined />,
              label: 'Agregar Clientes',
            },
            {
              key: '3',
              icon: <UploadOutlined />,
              label: 'Información Cliente',
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: '#fff' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#fff',
          }}
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
