# 🗺️ Mapa do Banco de Dados (Supabase)

Este documento contém o mapeamento de tabelas, colunas e tipos do projeto Ticketera.

## 📋 Tabela: `event_categories`
| Coluna | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `id` | `uuid` | ✅ | Note:
This is a Primary Key.<pk/> |
| `name` | `text` | ✅ | - |
| `icon` | `text` | ❌ | - |
| `created_at` | `timestamp with time zone` | ❌ | - |

---

## 📋 Tabela: `events`
| Coluna | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `id` | `uuid` | ✅ | Note:
This is a Primary Key.<pk/> |
| `organizer_id` | `uuid` | ✅ | - |
| `title` | `text` | ✅ | - |
| `slug` | `text` | ✅ | - |
| `description` | `text` | ❌ | - |
| `category` | `text` | ❌ | - |
| `status` | `text` | ❌ | - |
| `start_date` | `timestamp with time zone` | ❌ | - |
| `end_date` | `timestamp with time zone` | ❌ | - |
| `location_name` | `text` | ❌ | - |
| `address` | `text` | ❌ | - |
| `banner_url` | `text` | ❌ | - |
| `is_featured` | `boolean` | ❌ | - |
| `created_at` | `timestamp with time zone` | ❌ | - |
| `updated_at` | `timestamp with time zone` | ❌ | - |
| `city` | `text` | ❌ | - |
| `state` | `text` | ❌ | - |
| `postal_code` | `text` | ❌ | - |
| `capacity` | `integer` | ❌ | - |
| `event_type` | `text` | ❌ | - |

---

## 📋 Tabela: `organizer_details`
| Coluna | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `id` | `uuid` | ✅ | Note:
This is a Primary Key.<pk/> |
| `user_id` | `uuid` | ✅ | - |
| `company_name` | `text` | ❌ | - |
| `slug` | `text` | ❌ | - |
| `cnpj` | `text` | ❌ | - |
| `cpf` | `text` | ❌ | - |
| `phone` | `text` | ❌ | - |
| `bio` | `text` | ❌ | - |
| `asaas_key` | `text` | ❌ | - |
| `logo_url` | `text` | ❌ | - |
| `banner_url` | `text` | ❌ | - |
| `social_links` | `jsonb` | ❌ | - |
| `address_data` | `jsonb` | ❌ | - |
| `created_at` | `timestamp with time zone` | ❌ | - |
| `updated_at` | `timestamp with time zone` | ❌ | - |
| `rg` | `text` | ❌ | - |
| `birth_date` | `text` | ❌ | - |
| `postal_code` | `text` | ❌ | - |
| `document_front_url` | `text` | ❌ | - |
| `document_back_url` | `text` | ❌ | - |
| `instagram_url` | `text` | ❌ | - |
| `facebook_url` | `text` | ❌ | - |
| `whatsapp_number` | `text` | ❌ | - |
| `website_url` | `text` | ❌ | - |
| `company_address` | `text` | ❌ | - |
| `last_step` | `integer` | ❌ | - |
| `address` | `text` | ❌ | - |
| `city` | `text` | ❌ | - |
| `state` | `text` | ❌ | - |
| `category` | `text` | ❌ | - |

---

## 📋 Tabela: `organizer_posts`
| Coluna | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `id` | `uuid` | ✅ | Note:
This is a Primary Key.<pk/> |
| `organizer_id` | `uuid` | ❌ | Note:
This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/> |
| `caption` | `text` | ❌ | - |
| `image_url` | `text` | ✅ | - |
| `created_at` | `timestamp with time zone` | ✅ | - |

---

## 📋 Tabela: `product_orders`
| Coluna | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `id` | `uuid` | ✅ | Note:
This is a Primary Key.<pk/> |
| `organizer_id` | `uuid` | ❌ | Note:
This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/> |
| `buyer_id` | `uuid` | ❌ | Note:
This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/> |
| `total_amount` | `numeric` | ✅ | - |
| `status` | `text` | ❌ | - |
| `shipping_address` | `jsonb` | ❌ | - |
| `items` | `jsonb` | ✅ | - |
| `created_at` | `timestamp with time zone` | ✅ | - |

---

## 📋 Tabela: `product_variants`
| Coluna | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `id` | `uuid` | ✅ | Note:
This is a Primary Key.<pk/> |
| `product_id` | `uuid` | ❌ | Note:
This is a Foreign Key to `products.id`.<fk table='products' column='id'/> |
| `name` | `text` | ✅ | - |
| `attributes` | `jsonb` | ❌ | - |
| `price` | `numeric` | ❌ | - |
| `stock` | `integer` | ❌ | - |
| `sku` | `text` | ❌ | - |
| `created_at` | `timestamp with time zone` | ✅ | - |

---

## 📋 Tabela: `products`
| Coluna | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `id` | `uuid` | ✅ | Note:
This is a Primary Key.<pk/> |
| `organizer_id` | `uuid` | ❌ | Note:
This is a Foreign Key to `profiles.id`.<fk table='profiles' column='id'/> |
| `category_id` | `uuid` | ❌ | - |
| `name` | `text` | ✅ | - |
| `description` | `text` | ❌ | - |
| `price` | `numeric` | ✅ | - |
| `sale_price` | `numeric` | ❌ | - |
| `image_url` | `text` | ❌ | - |
| `images` | `jsonb` | ❌ | - |
| `status` | `text` | ❌ | - |
| `has_variants` | `boolean` | ❌ | - |
| `delivery_options` | `jsonb` | ❌ | - |
| `stock_strategy` | `text` | ❌ | - |
| `total_stock` | `integer` | ❌ | - |
| `is_featured` | `boolean` | ❌ | - |
| `created_at` | `timestamp with time zone` | ✅ | - |
| `updated_at` | `timestamp with time zone` | ✅ | - |

---

## 📋 Tabela: `profiles`
| Coluna | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `id` | `uuid` | ✅ | Note:
This is a Primary Key.<pk/> |
| `user_id` | `uuid` | ✅ | - |
| `name` | `text` | ✅ | - |
| `email` | `text` | ✅ | - |
| `role` | `text` | ❌ | - |
| `status` | `text` | ❌ | - |
| `profile_complete` | `boolean` | ❌ | - |
| `created_at` | `timestamp with time zone` | ❌ | - |
| `updated_at` | `timestamp with time zone` | ❌ | - |
| `onboarding_feed` | `jsonb` | ❌ | - |

---

## 📋 Tabela: `purchased_tickets`
| Coluna | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `id` | `uuid` | ✅ | Note:
This is a Primary Key.<pk/> |
| `user_id` | `uuid` | ✅ | - |
| `event_id` | `uuid` | ✅ | Note:
This is a Foreign Key to `events.id`.<fk table='events' column='id'/> |
| `ticket_id` | `uuid` | ✅ | Note:
This is a Foreign Key to `tickets.id`.<fk table='tickets' column='id'/> |
| `status` | `text` | ❌ | - |
| `photo_url` | `text` | ❌ | - |
| `qr_code_data` | `text` | ✅ | - |
| `purchase_date` | `timestamp with time zone` | ❌ | - |
| `created_at` | `timestamp with time zone` | ❌ | - |

---

## 📋 Tabela: `sales`
| Coluna | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `id` | `uuid` | ✅ | Note:
This is a Primary Key.<pk/> |
| `event_id` | `uuid` | ❌ | Note:
This is a Foreign Key to `events.id`.<fk table='events' column='id'/> |
| `customer_id` | `uuid` | ❌ | - |
| `total_amount` | `numeric` | ✅ | - |
| `payment_status` | `text` | ❌ | - |
| `payment_method` | `text` | ❌ | - |
| `asaas_id` | `text` | ❌ | - |
| `created_at` | `timestamp with time zone` | ❌ | - |

---

## 📋 Tabela: `staff`
| Coluna | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `id` | `uuid` | ✅ | Note:
This is a Primary Key.<pk/> |
| `event_id` | `uuid` | ❌ | Note:
This is a Foreign Key to `events.id`.<fk table='events' column='id'/> |
| `user_id` | `uuid` | ❌ | - |
| `name` | `text` | ✅ | - |
| `email` | `text` | ✅ | - |
| `role` | `text` | ❌ | - |
| `is_active` | `boolean` | ❌ | - |
| `created_at` | `timestamp with time zone` | ❌ | - |

---

## 📋 Tabela: `tickets`
| Coluna | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `id` | `uuid` | ✅ | Note:
This is a Primary Key.<pk/> |
| `event_id` | `uuid` | ✅ | Note:
This is a Foreign Key to `events.id`.<fk table='events' column='id'/> |
| `name` | `text` | ✅ | - |
| `description` | `text` | ❌ | - |
| `price` | `numeric` | ✅ | - |
| `quantity` | `integer` | ✅ | - |
| `remaining` | `integer` | ✅ | - |
| `category` | `text` | ❌ | - |
| `is_active` | `boolean` | ❌ | - |
| `created_at` | `timestamp with time zone` | ❌ | - |
| `updated_at` | `timestamp with time zone` | ❌ | - |

---

## 📋 Tabela: `webhook_configs`
| Coluna | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `id` | `uuid` | ✅ | Note:
This is a Primary Key.<pk/> |
| `event_key` | `text` | ✅ | - |
| `url` | `text` | ✅ | - |
| `is_active` | `boolean` | ❌ | - |
| `description` | `text` | ❌ | - |
| `created_at` | `timestamp with time zone` | ❌ | - |

---

## 📋 Tabela: `webhook_logs`
| Coluna | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `id` | `uuid` | ✅ | Note:
This is a Primary Key.<pk/> |
| `event_key` | `text` | ✅ | - |
| `url` | `text` | ❌ | - |
| `status` | `text` | ❌ | - |
| `payload` | `jsonb` | ❌ | - |
| `response` | `text` | ❌ | - |
| `created_at` | `timestamp with time zone` | ❌ | - |

---

