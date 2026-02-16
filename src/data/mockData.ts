
export interface Event {
  id: string;
  title: string;
  description: string;
  bannerUrl: string;
  heroImageUrl?: string; // New field for hero carousel optimized images
  location: {
    name: string;
    address: string;
    city: string;
    state: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  date: string; // ISO date string
  startTime: string;
  endTime: string;
  category: string;
  organizer: {
    id: string;
    name: string;
  };
  tickets: Ticket[];
  gallery: Photo[];
  featured?: boolean; // Added featured property
}

export interface Ticket {
  id: string;
  name: string;
  price: number;
  quantity: number;
  remaining: number;
  batch: string;
  description?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  photoUrl: string;
  role: 'customer' | 'organizer' | 'admin';
  tickets: PurchasedTicket[];
}

export interface PurchasedTicket {
  id: string;
  eventId: string;
  eventTitle: string;
  ticketId: string;
  ticketName: string;
  price: number;
  purchaseDate: string;
  status: 'active' | 'used' | 'cancelled';
  qrCode: string;
  observation?: string;
}

export interface Photo {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  photoUrl: string;
  caption?: string;
  likes: number;
  uploadDate: string;
}

// Mock Events Data
export const events: Event[] = [
  // --- Music Events ---
  {
    id: '1',
    title: 'Festival SanjaMusic 2025',
    description: 'O maior festival de música de São José dos Campos! Três dias de shows com os melhores artistas nacionais e internacionais em um ambiente incrível com muita música, arte e diversão para todos os gostos.',
    bannerUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    heroImageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1920&auto=format&fit=crop',
    location: {
      name: 'Parque da Cidade',
      address: 'Avenida Olivo Gomes, 100',
      city: 'São José dos Campos',
      state: 'SP',
      coordinates: {
        lat: -23.221112,
        lng: -45.908814,
      },
    },
    date: '2025-07-15',
    startTime: '16:00',
    endTime: '23:00',
    category: 'music',
    organizer: {
      id: '1',
      name: 'EventPro Produções',
    },
    tickets: [
      {
        id: '101',
        name: 'Ingresso Comum',
        price: 150,
        quantity: 5000,
        remaining: 2340,
        batch: '1º Lote',
      },
      {
        id: '102',
        name: 'Ingresso VIP',
        price: 300,
        quantity: 1000,
        remaining: 430,
        batch: '1º Lote',
        description: 'Área exclusiva com open bar',
      },
      {
        id: '103',
        name: 'Camarote Premium',
        price: 500,
        quantity: 200,
        remaining: 45,
        batch: 'Lote Único',
        description: 'Acesso ao camarote com open bar e food',
      },
    ],
    gallery: [
      {
        id: '201',
        eventId: '1',
        userId: '1001',
        userName: 'Maria Silva',
        photoUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        caption: 'Melhor show da minha vida!',
        likes: 45,
        uploadDate: '2024-07-16T14:22:00Z',
      },
      {
        id: '202',
        eventId: '1',
        userId: '1002',
        userName: 'João Pereira',
        photoUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        caption: 'Galera animada!',
        likes: 32,
        uploadDate: '2024-07-16T18:15:00Z',
      },
      {
        id: '203',
        eventId: '1',
        userId: '1003',
        userName: 'Ana Souza',
        photoUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        caption: 'Noite inesquecível!',
        likes: 78,
        uploadDate: '2024-07-17T10:05:00Z',
      },
    ],
    featured: true,
  },
  {
    id: "11",
    title: "Festival de Jazz na Praia",
    date: "2025-12-10",
    startTime: "16:00",
    endTime: "23:00",
    description: "Um dia inteiro de jazz à beira-mar com artistas renomados e novos talentos.",
    bannerUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop",
    heroImageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&auto=format&fit=crop",
    location: {
      name: "Praia Grande",
      address: "Av. Presidente Castelo Branco",
      city: "Santos",
      state: "SP",
      coordinates: {
        lat: -23.967896,
        lng: -46.332636
      }
    },
    tickets: [
      {
        id: "111",
        name: "Entrada Comum",
        description: "Acesso a todas as áreas do festival",
        price: 120.00,
        quantity: 500,
        remaining: 125,
        batch: "1º Lote"
      },
      {
        id: "112",
        name: "Premium",
        description: "Acesso a todas as áreas + área VIP com open bar",
        price: 250.00,
        quantity: 100,
        remaining: 15,
        batch: "Lote Único"
      }
    ],
    category: "music",
    featured: true,
    organizer: {
      id: "3",
      name: "Risos Produções"
    },
    gallery: []
  },
  {
    id: "16",
    title: "Encontro de Colecionadores de Vinil",
    date: "2026-01-05",
    startTime: "10:00",
    endTime: "18:00",
    description: "Traga seus discos e troque com outros colecionadores neste evento único.",
    bannerUrl: "https://images.unsplash.com/photo-1502773860571-211a597d6e4b?w=800&auto=format&fit=crop",
    location: {
      name: "Centro Cultural",
      address: "Rua Rubião Júnior, 84",
      city: "São José dos Campos",
      state: "SP",
      coordinates: {
        lat: -23.194254,
        lng: -45.901537
      }
    },
    tickets: [
      {
        id: "161",
        name: "Visitante",
        description: "Acesso ao evento",
        price: 15.00,
        quantity: 150,
        remaining: 112,
        batch: "1º Lote"
      },
      {
        id: "162",
        name: "Expositor",
        description: "Mesa para exposição/venda de itens",
        price: 60.00,
        quantity: 30,
        remaining: 5,
        batch: "Lote Único"
      }
    ],
    category: "music",
    featured: false,
    organizer: {
      id: "1",
      name: "EventPro Produções"
    },
    gallery: []
  },

  // --- Workshops / Business Events ---
  {
    id: '2',
    title: 'Congresso Tech+',
    description: 'O maior congresso de tecnologia do Vale do Paraíba. Palestras, workshops e networking com os principais nomes do mercado de tecnologia do Brasil e do mundo.',
    bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    heroImageUrl: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=1920&auto=format&fit=crop',
    location: {
      name: 'Centro de Convenções',
      address: 'Av. São João, 2200',
      city: 'São José dos Campos',
      state: 'SP',
      coordinates: {
        lat: -23.179076,
        lng: -45.884109,
      },
    },
    date: '2025-06-10',
    startTime: '08:00',
    endTime: '18:00',
    category: 'workshop', // Changed from business to match UI
    organizer: {
      id: '2',
      name: 'TechVale Group',
    },
    tickets: [
      {
        id: '201',
        name: 'Credencial Basic',
        price: 290,
        quantity: 1000,
        remaining: 320,
        batch: '2º Lote',
      },
      {
        id: '202',
        name: 'Credencial Full',
        price: 590,
        quantity: 500,
        remaining: 125,
        batch: '2º Lote',
        description: 'Acesso a todas as palestras e workshops',
      },
      {
        id: '203',
        name: 'Credencial Premium',
        price: 990,
        quantity: 100,
        remaining: 15,
        batch: 'Lote Final',
        description: 'Acesso completo + networking dinner + certificado',
      },
    ],
    gallery: [
      {
        id: '204',
        eventId: '2',
        userId: '1004',
        userName: 'Carlos Mendes',
        photoUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        caption: 'Palestra incrível sobre IA!',
        likes: 54,
        uploadDate: '2024-06-10T16:22:00Z',
      },
      {
        id: '205',
        eventId: '2',
        userId: '1005',
        userName: 'Patricia Lima',
        photoUrl: 'https://images.unsplash.com/photo-1558008258-3256797b43f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1331&q=80',
        caption: 'Networking de alto nível!',
        likes: 41,
        uploadDate: '2024-06-11T09:15:00Z',
      },
    ],
    featured: true,
  },
  {
    id: "12",
    title: "Workshop de Fotografia",
    date: "2025-12-15",
    startTime: "09:00",
    endTime: "18:00",
    description: "Aprenda técnicas avançadas de fotografia com profissionais premiados.",
    bannerUrl: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&auto=format&fit=crop",
    location: {
      name: "Estúdio Luz",
      address: "Rua das Artes, 123",
      city: "São José dos Campos",
      state: "SP",
      coordinates: {
        lat: -23.184894,
        lng: -45.884764
      }
    },
    tickets: [
      {
        id: "121",
        name: "Participante",
        description: "Acesso ao workshop + material digital",
        price: 180.00,
        quantity: 30,
        remaining: 8,
        batch: "Lote Único"
      }
    ],
    category: "workshop",
    featured: false,
    organizer: {
      id: "2",
      name: "TechVale Group"
    },
    gallery: []
  },
  {
    id: "17",
    title: "Hackathon: Tecnologia para Cidades Inteligentes",
    date: "2026-01-10",
    startTime: "08:00",
    endTime: "20:00",
    description: "48 horas de imersão para desenvolver soluções tecnológicas para problemas urbanos.",
    bannerUrl: "https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?w=800&auto=format&fit=crop",
    location: {
      name: "Hub de Inovação",
      address: "Av. Dr. Sebastião Henrique da Cunha Pontes, 8000",
      city: "São José dos Campos",
      state: "SP",
      coordinates: {
        lat: -23.221112,
        lng: -45.908814
      }
    },
    tickets: [
      {
        id: "171",
        name: "Participante",
        description: "Acesso ao evento + alimentação durante os 2 dias",
        price: 0.00,
        quantity: 100,
        remaining: 32,
        batch: "Lote Único"
      }
    ],
    category: "workshop",
    featured: false,
    organizer: {
      id: "3",
      name: "Risos Produções"
    },
    gallery: []
  },
  {
    id: "19",
    title: "Palestra: Inteligência Artificial e o Futuro do Trabalho",
    date: "2026-01-20",
    startTime: "19:00",
    endTime: "21:30",
    description: "Discussão com especialistas sobre como a IA está transformando o mercado de trabalho.",
    bannerUrl: "https://images.unsplash.com/photo-1558403194-611308249627?w=800&auto=format&fit=crop",
    location: {
      name: "Auditório da Universidade",
      address: "Av. Shishima Hifumi, 2911",
      city: "São José dos Campos",
      state: "SP",
      coordinates: {
        lat: -23.207436,
        lng: -45.870498
      }
    },
    tickets: [
      {
        id: "191",
        name: "Entrada Regular",
        description: "Acesso à palestra",
        price: 35.00,
        quantity: 150,
        remaining: 83,
        batch: "1º Lote"
      },
      {
        id: "192",
        name: "Estudante",
        description: "Acesso à palestra (necessária comprovação)",
        price: 17.50,
        quantity: 100,
        remaining: 42,
        batch: "1º Lote"
      }
    ],
    category: "workshop",
    featured: false,
    organizer: {
      id: "1",
      name: "EventPro Produções"
    },
    gallery: []
  },

  // --- Theater / Comedy Events ---
  {
    id: '3',
    title: 'Stand-Up Night',
    description: 'Uma noite de muitas risadas com os melhores comediantes do Brasil. Venha se divertir com a melhor comédia stand-up em um ambiente descontraído e animado.',
    bannerUrl: 'https://images.unsplash.com/photo-1586523969132-7e160b554ae2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1253&q=80',
    heroImageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&auto=format&fit=crop',
    location: {
      name: 'Teatro Municipal',
      address: 'Rua Rubião Júnior, 84',
      city: 'São José dos Campos',
      state: "SP",
      coordinates: {
        lat: -23.194254,
        lng: -45.901537,
      },
    },
    date: '2025-08-25',
    startTime: '20:00',
    endTime: '22:30',
    category: 'theater', // Changed from comedy to match UI
    organizer: {
      id: '3',
      name: 'Risos Produções',
    },
    tickets: [
      {
        id: '301',
        name: 'A2 Tickets 360',
        price: 80,
        quantity: 300,
        remaining: 145,
        batch: '1º Lote',
      },
      {
        id: '302',
        name: 'Plateia VIP',
        price: 120,
        quantity: 100,
        remaining: 37,
        batch: '1º Lote',
        description: 'Primeiras fileiras com melhor visão',
      },
    ],
    gallery: [
      {
        id: '206',
        eventId: '3',
        userId: '1006',
        userName: 'Fernanda Castro',
        photoUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        caption: 'Noite de risadas!',
        likes: 67,
        uploadDate: '2024-08-26T10:42:00Z',
      },
      {
        id: '207',
        eventId: '3',
        userId: '1007',
        userName: 'Rafael Santos',
        photoUrl: 'https://images.unsplash.com/photo-1606639401613-4ed1e5c63c97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        caption: 'Show incrível!',
        likes: 30,
        uploadDate: '2024-08-26T09:15:00Z',
      },
    ],
    featured: true,
  },
  {
    id: "15",
    title: "Festival de Teatro Independente",
    date: "2025-12-25",
    startTime: "19:00",
    endTime: "22:30",
    description: "Apresentações de grupos teatrais independentes com peças inovadoras.",
    bannerUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&auto=format&fit=crop",
    heroImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&auto=format&fit=crop",
    location: {
      name: "Teatro Municipal",
      address: "Praça Afonso Pena, 50",
      city: "São José dos Campos",
      state: "SP",
      coordinates: {
        lat: -23.194254,
        lng: -45.901537
      }
    },
    tickets: [
      {
        id: "151",
        name: "Ingresso Regular",
        description: "Acesso a todas as apresentações do dia",
        price: 45.00,
        quantity: 200,
        remaining: 160,
        batch: "1º Lote"
      },
      {
        id: "152",
        name: "Pacote Festival",
        description: "Acesso a todas as apresentações durante os 3 dias",
        price: 110.00,
        quantity: 50,
        remaining: 22,
        batch: "Lote Único"
      }
    ],
    category: "theater",
    featured: true,
    organizer: {
      id: "2",
      name: "TechVale Group"
    },
    gallery: []
  },
  {
    id: "21",
    title: "Noite do Riso: Especial de Férias",
    date: "2026-02-10",
    startTime: "21:00",
    endTime: "23:00",
    description: "Um show especial para encerrar as férias com chave de ouro e muitas gargalhadas.",
    bannerUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop",
    location: {
      name: "Clube da Comédia",
      address: "Av. Anchieta, 300",
      city: "São José dos Campos",
      state: "SP",
      coordinates: {
        lat: -23.199000,
        lng: -45.900000
      }
    },
    tickets: [
      {
        id: "211",
        name: "Mesa para 4",
        description: "Mesa reservada com vista privilegiada",
        price: 160.00,
        quantity: 20,
        remaining: 5,
        batch: "Lote Único"
      },
      {
        id: "212",
        name: "Individual",
        description: "Lugar não marcado",
        price: 35.00,
        quantity: 100,
        remaining: 45,
        batch: "Lote Único"
      }
    ],
    category: "theater",
    featured: false,
    organizer: {
      id: "3",
      name: "Risos Produções"
    },
    gallery: []
  },

  // --- Other Categories ---
  {
    id: "13",
    title: "Feira Gastronômica Internacional",
    date: "2025-12-18",
    startTime: "10:00",
    endTime: "22:00",
    description: "Experimente sabores de todo o mundo em um único lugar.",
    bannerUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop",
    heroImageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&auto=format&fit=crop",
    location: {
      name: "Parque da Cidade",
      address: "Av. Central",
      city: "São José dos Campos",
      state: "SP",
      coordinates: {
        lat: -23.221112,
        lng: -45.908814
      }
    },
    tickets: [
      {
        id: "131",
        name: "Entrada",
        description: "Acesso à feira (consumo à parte)",
        price: 30.00,
        quantity: 1000,
        remaining: 600,
        batch: "1º Lote"
      },
      {
        id: "132",
        name: "Passaporte Gourmet",
        description: "Inclui degustação em 5 estandes selecionados",
        price: 85.00,
        quantity: 200,
        remaining: 75,
        batch: "Lote Único"
      }
    ],
    category: "food",
    featured: true,
    organizer: {
      id: "1",
      name: "EventPro Produções"
    },
    gallery: []
  },
  {
    id: "18",
    title: "Festival de Cerveja Artesanal",
    date: "2026-01-15",
    startTime: "14:00",
    endTime: "23:00",
    description: "Deguste as melhores cervejas artesanais da região com música ao vivo.",
    bannerUrl: "https://images.unsplash.com/photo-1575367439058-6096bb9cf5e2?w=800&auto=format&fit=crop",
    heroImageUrl: "https://images.unsplash.com/photo-1436114742180-c61fcbda8509?w=1920&auto=format&fit=crop",
    location: {
      name: "Parque Vicentina Aranha",
      address: "R. Eng. Prudente Meireles de Morais, 302",
      city: "São José dos Campos",
      state: "SP",
      coordinates: {
        lat: -23.192807,
        lng: -45.892553
      }
    },
    tickets: [
      {
        id: "181",
        name: "Entrada",
        description: "Inclui copo personalizado e 2 fichas de degustação",
        price: 50.00,
        quantity: 500,
        remaining: 187,
        batch: "1º Lote"
      },
      {
        id: "182",
        name: "Premium",
        description: "Inclui copo personalizado, 5 fichas de degustação e acesso à área VIP",
        price: 120.00,
        quantity: 100,
        remaining: 37,
        batch: "Lote Premium"
      }
    ],
    category: "food",
    featured: true,
    organizer: {
      id: "2",
      name: "TechVale Group"
    },
    gallery: []
  },
  {
    id: "14",
    title: "Corrida Beneficente 5K",
    date: "2025-12-20",
    startTime: "07:00",
    endTime: "11:00",
    description: "Participe desta corrida e ajude instituições de caridade locais.",
    bannerUrl: "https://images.unsplash.com/photo-1509255929945-586a420363cf?w=800&auto=format&fit=crop",
    location: {
      name: "Parque Santos Dumont",
      address: "Av. Olivo Gomes",
      city: "São José dos Campos",
      state: "SP",
      coordinates: {
        lat: -23.162985,
        lng: -45.909048
      }
    },
    tickets: [
      {
        id: "141",
        name: "Inscrição",
        description: "Kit corrida + medalha de participação",
        price: 65.00,
        quantity: 300,
        remaining: 120,
        batch: "1º Lote"
      }
    ],
    category: "sports",
    featured: false,
    organizer: {
      id: "3",
      name: "Risos Produções"
    },
    gallery: []
  },
  {
    id: "20",
    title: "Retiro de Yoga e Meditação",
    date: "2026-01-25",
    startTime: "14:00",
    endTime: "16:00",
    description: "Um fim de semana de reconexão com a natureza e práticas de bem-estar.",
    bannerUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop",
    location: {
      name: "Pousada Serenidade",
      address: "Estrada do Monte Verde, Km 5",
      city: "Monteiro Lobato",
      state: "SP",
      coordinates: {
        lat: -22.954450,
        lng: -45.840173
      }
    },
    tickets: [
      {
        id: "201",
        name: "Pacote Completo",
        description: "2 diárias com hospedagem, alimentação e todas as atividades",
        price: 750.00,
        quantity: 30,
        remaining: 12,
        batch: "Lote Único"
      },
      {
        id: "202",
        name: "Day Use",
        description: "Acesso às atividades por um dia (sem hospedagem)",
        price: 180.00,
        quantity: 20,
        remaining: 8,
        batch: "Lote Único"
      }
    ],
    category: "wellness",
    featured: false,
    organizer: {
      id: "3",
      name: "Risos Produções"
    },
    gallery: []
  }
];

// Mock Users Data
export const users: User[] = [
  {
    id: '1001',
    name: 'Maria Silva',
    email: 'maria@example.com',
    cpf: '123.456.789-00',
    photoUrl: 'https://randomuser.me/api/portraits/women/12.jpg',
    role: 'customer',
    tickets: [
      {
        id: 'pur101',
        eventId: '1',
        eventTitle: 'Festival SanjaMusic 2025',
        ticketId: '101',
        ticketName: 'Ingresso Comum',
        price: 150,
        purchaseDate: '2024-05-12T10:22:00Z',
        status: 'active',
        qrCode: 'pur101-qrcode',
      },
      {
        id: 'pur102',
        eventId: '2',
        eventTitle: 'Congresso Tech+',
        ticketId: '201',
        ticketName: 'Credencial Basic',
        price: 290,
        purchaseDate: '2024-04-15T14:30:00Z',
        status: 'active',
        qrCode: 'pur102-qrcode',
      },
    ],
  },
  {
    id: '1002',
    name: 'João Pereira',
    email: 'joao@example.com',
    cpf: '987.654.321-00',
    photoUrl: 'https://randomuser.me/api/portraits/men/22.jpg',
    role: 'customer',
    tickets: [
      {
        id: 'pur103',
        eventId: '1',
        eventTitle: 'Festival SanjaMusic 2025',
        ticketId: '102',
        ticketName: 'Ingresso VIP',
        price: 300,
        purchaseDate: '2024-05-10T09:15:00Z',
        status: 'active',
        qrCode: 'pur103-qrcode',
      },
    ],
  },
  {
    id: '2001',
    name: 'Ana Oliveira',
    email: 'ana@eventpro.com',
    cpf: '111.222.333-44',
    photoUrl: 'https://randomuser.me/api/portraits/women/34.jpg',
    role: 'organizer',
    tickets: [],
  },
  {
    id: '3001',
    name: 'Carlos Admin',
    email: 'admin@a2tickets.com',
    cpf: '555.666.777-88',
    photoUrl: 'https://randomuser.me/api/portraits/men/45.jpg',
    role: 'admin',
    tickets: [],
  },
];

// More Gallery Photos
export const galleryPhotos: Photo[] = [
  {
    id: '301',
    eventId: '1',
    userId: '1001',
    userName: 'Maria Silva',
    photoUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    caption: 'Momentos inesquecíveis',
    likes: 87,
    uploadDate: '2024-07-16T15:30:00Z',
  },
  {
    id: '302',
    eventId: '1',
    userId: '1002',
    userName: 'João Pereira',
    photoUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    likes: 54,
    uploadDate: '2024-07-16T17:45:00Z',
  },
  {
    id: '303',
    eventId: '1',
    userId: '1003',
    userName: 'Ana Souza',
    photoUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    caption: 'Show incrível!',
    likes: 92,
    uploadDate: '2024-07-17T09:15:00Z',
  },
  {
    id: '304',
    eventId: '2',
    userId: '1004',
    userName: 'Carlos Mendes',
    photoUrl: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    caption: 'Palestra inspiradora',
    likes: 61,
    uploadDate: '2024-06-10T19:22:00Z',
  },
  {
    id: '305',
    eventId: '2',
    userId: '1005',
    userName: 'Patricia Lima',
    photoUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    caption: 'Conheci pessoas incríveis!',
    likes: 49,
    uploadDate: '2024-06-11T10:30:00Z',
  },
  {
    id: '306',
    eventId: '3',
    userId: '1006',
    userName: 'Fernanda Castro',
    photoUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    caption: 'Melhor stand-up!',
    likes: 73,
    uploadDate: '2024-08-26T11:15:00Z',
  },
];

// Generate a mock QR code URL
export const generateQRCode = (ticketId: string) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticketId}`;
};

// Partners data for the carousel
export const partners = [
  {
    id: 1,
    name: "PrefeituraSJC",
    logo: "https://images.unsplash.com/photo-1566125882500-87e10f726cdc?w=800&auto=format&fit=crop",
    description: "Prefeitura de São José dos Campos"
  },
  {
    id: 2,
    name: "SpaceX",
    logo: "https://images.unsplash.com/photo-1518364538800-6bae3c2ea0f2?w=800&auto=format&fit=crop",
    description: "SpaceX"
  },
  {
    id: 3,
    name: "Embraer",
    logo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop",
    description: "Embraer"
  },
  {
    id: 4,
    name: "Parque Tecnológico",
    logo: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop",
    description: "Parque Tecnológico SJC"
  },
  {
    id: 5,
    name: "INPE",
    logo: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&auto=format&fit=crop",
    description: "Instituto Nacional de Pesquisas Espaciais"
  },
  {
    id: 6,
    name: "UNESP",
    logo: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop",
    description: "Universidade Estadual Paulista"
  },
  {
    id: 7,
    name: "ITA",
    logo: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop",
    description: "Instituto Tecnológico de Aeronáutica"
  },
  {
    id: 8,
    name: "CTA",
    logo: "https://images.unsplash.com/photo-1572947650440-e8a97ef053b2?w=800&auto=format&fit=crop",
    description: "Centro Técnico Aeroespacial"
  }
];

export const allEvents = events;
