
import React from 'react';
import { SectionDetail } from './types';

export const TRADITIONAL_SECTIONS: SectionDetail[] = [
  { id: '1', title: 'Resumen Ejecutivo', timestamp: '1:43', icon: '📝', description: 'Brinda una descripción general de la empresa, sus objetivos, producto/servicio, equipo directivo e información financiera.' },
  { id: '2', title: 'Descripción de la Compañía', timestamp: '2:09', icon: '🏢', description: 'Detalla los problemas que la empresa resuelve, el mercado y las ventajas competitivas.' },
  { id: '3', title: 'Análisis de Mercado', timestamp: '2:43', icon: '📊', description: 'Se enfoca en conocer las necesidades del mercado y el análisis de la competencia.' },
  { id: '4', title: 'Organización y Gestión', timestamp: '3:11', icon: '👥', description: 'Explica la estructura legal, organigrama y experiencia del equipo directivo.' },
  { id: '5', title: 'Línea de Servicios o Productos', timestamp: '3:55', icon: '📦', description: 'Describe el producto, sus beneficios, ciclo de vida y propiedad intelectual.' },
  { id: '6', title: 'Publicidad y Ventas', timestamp: '4:17', icon: '📢', description: 'Estrategias de mercadeo, publicidad, ventas y procesos de atención al cliente.' },
  { id: '7', title: 'Solicitud de Financiamiento', timestamp: '4:43', icon: '💰', description: 'Establece las necesidades de capital, monto requerido y uso de los fondos.' },
  { id: '8', title: 'Proyecciones Financieras', timestamp: '5:36', icon: '📈', description: 'Muestra la estabilidad financiera con estados de resultados y flujos de caja.' },
  { id: '9', title: 'Apéndice', timestamp: '6:40', icon: '📎', description: 'Documentos de respaldo como historiales de crédito, CVs, licencias y contratos.' },
];

export const LEAN_SECTIONS: SectionDetail[] = [
  { id: 'L1', title: 'Alianzas Clave', timestamp: '7:55', icon: '🤝', description: 'Otros negocios y servicios con los que la empresa colaborará (proveedores, aliados).' },
  { id: 'L2', title: 'Recursos Clave', timestamp: '8:11', icon: '🛠️', description: 'Los recursos más importantes: personal, capital y propiedad intelectual.' },
  { id: 'L3', title: 'Propuesta de Valor', timestamp: '8:23', icon: '💎', description: 'Declaración clara sobre el valor especial que aportas al mercado.' },
  { id: 'L4', title: 'Relaciones con Clientes', timestamp: '8:32', icon: '❤️', description: 'Forma en que los clientes se relacionarán con la empresa (personal, online).' },
  { id: 'L5', title: 'Segmentos de Cliente', timestamp: '8:49', icon: '🎯', description: 'El mercado meta específico al que la empresa servirá.' },
  { id: 'L6', title: 'Canales', timestamp: '8:53', icon: '🚚', description: 'Formas más importantes de comunicación y entrega al cliente.' },
  { id: 'L7', title: 'Estructura de Costos', timestamp: '9:06', icon: '⚖️', description: 'Inversión total, costos operativos, estrategias y desafíos financieros.' },
  { id: 'L8', title: 'Corrientes de Ingresos', timestamp: '9:18', icon: '💵', description: 'Explicación de cómo generarás dinero (ventas, cuotas, publicidad).' },
];
