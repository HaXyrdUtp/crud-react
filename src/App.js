import React, { useState, useEffect } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  PlusCircleFilled,
  EditFilled,
  DeleteFilled
} from '@ant-design/icons';

import { Button, Layout, Menu, Table, Input, Select, Space, Divider, notification, Typography, Tooltip } from 'antd';
import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import './App.css';

const { Header, Sider, Content } = Layout;
const {Title, Text} = Typography;

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
  const [api, contextHolder] = notification.useNotification();

  const handleMenuClick = (e) => {
    setSelectedNav(e.key);
  };

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
      setSelectedNav('1');
      api.success({
        message: 'Cliente Agregado',
        description: 'El cliente ha sido agregado con éxito.',
      });
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
    setSelectedNav('3');
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
      setCurrentClienteId(null);
      setSelectedNav('1'); 
      api.success({
        message: 'Cliente Editado',
        description: 'El cliente ha sido editado con éxito.',
      });
    } catch (error) {
      console.log(error);
    }
  };

  const eliminarCliente = (id) => {
    const key = `open${Date.now()}`;
    const btn = (
      <Space>
        <Button type="link" size="small" onClick={() => api.destroy()}>
          Cancelar
        </Button>
        <Button type="primary" size="small" onClick={async () => {
          await deleteDoc(doc(db, 'Proyectos', id));
          const arrayFiltrado = clientes.filter(item => item.id !== id);
          setClientes(arrayFiltrado);
          api.destroy(key);
        }}>
          Confirmar
        </Button>
      </Space>
    );
    api.open({
      message: 'Eliminar Cliente',
      description: '¿Estás seguro que deseas eliminar este cliente?',
      btn,
      key,
      onClose: () => console.log('Se ha cerrado la notificación.'),
    });
  };

  const columns = [
    {
      title: 'Nombre del Cliente',
      dataIndex: 'clienteNombre',
      filters: clientes.map(cliente => ({
        text: cliente.clienteNombre,
        value: cliente.clienteNombre,
      })),
      sorter: (a, b) => a.clienteNombre.length - b.clienteNombre.length,
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
        <Space>
          <Button type = "primary" onClick={() => editarCliente(record)}>
            <Tooltip title="Editar">
              <EditFilled />
            </Tooltip>
            
          </Button>

          <Button type="primary" danger onClick={() => eliminarCliente(record.id) }>
            <Tooltip title="Eliminar">
              <DeleteFilled />
            </Tooltip>
          </Button>
        </Space>
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
            <Divider orientation="left" style={{ fontSize: 25 }}>Agregar Cliente</Divider>
            <form onSubmit={agregarCliente}>
              <Space size="middle" direction="vertical" style={{ width: '100%' }}>
                <Text strong>Cliente</Text>
                <Input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Ingrese el cliente"
                  value={clienteNombre}
                  onChange={e => setClienteNombre(e.target.value)}
                />
                <Text strong>Nombre</Text>
                <Input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Ingrese el nombre"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                />
                <Text strong>Ubicación</Text>
                <Input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Ingrese la ubicación"
                  value={ubicacion}
                  onChange={e => setUbicacion(e.target.value)}
                />
                <Text strong>Mapa</Text>
                <Input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Ingrese el mapa"
                  value={mapa}
                  onChange={e => setMapa(e.target.value)}
                />
                <Text strong>Estatus</Text>
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
                  Agregar
                </Button>
              </Space>
            </form>
          </>
        );
      case '3':
        return (
          <>
            <Divider orientation="left" style={{ fontSize: 25 }}>Editar Cliente</Divider>
            <form onSubmit={actualizarCliente}>
              <Space size="middle" direction="vertical" style={{ width: '100%' }}>
                <Text strong>Cliente</Text>
                <Input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Ingrese el cliente"
                  value={clienteNombre}
                  onChange={e => setClienteNombre(e.target.value)}
                />
                <Text strong>Nombre</Text>
                <Input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Ingrese el nombre"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                />
                <Text strong>Ubicacion</Text>
                <Input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Ingrese la ubicación"
                  value={ubicacion}
                  onChange={e => setUbicacion(e.target.value)}
                />
                <Text strong>Mapa</Text>
                <Input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Ingrese el mapa"
                  value={mapa}
                  onChange={e => setMapa(e.target.value)}
                />
                <Text strong>Estatus</Text>
                <Select
                  className="form-control mb-2"
                  defaultValue={"Seleccione"}
                  onChange={e => setEstatus(e)}
                  options={[
                    { value: 'En curso', label: 'En curso' },
                    { value: 'Stand By', label: 'Stand By' },
                    { value: 'Terminado', label: 'Terminado' }
                  ]}
                />
                <Button type="primary" htmlType="submit" className="btn btn-primary btn-block">
                  Confirmar
                </Button>
              </Space>
            </form>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Layout className="layout">
      {contextHolder}
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          selectedKeys={[selectedNav]}
          onClick= {handleMenuClick}
          items={[
            {
              key: '1',
              icon: <UserOutlined />,
              label: 'Clientes',
            },
            {
              key: '2',
              icon: <PlusCircleFilled />,
              label: 'Agregar Clientes',
            },
            {
              key: '3',
              icon: <EditFilled/>,
              label: 'Editar Cliente',
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header className="header">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="menu-button"
          />
        </Header>
        <Content className="content">
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
