# Guia de Dimensões e Proporções de Imagens

Fiz uma varredura completa no código-fonte, componentes de layout (`src/components`), telas (`src/pages`) e painéis de administração para catalogar o padrão de recorte e as medidas ideais de imagens de toda a plataforma A2Tickets360.

Abaixo está a tabela oficial recomendada para produtores, designers e administradores.

## 1. Identidade Visual e UI
| Localização | Componentes Analisados | Proporção (CSS) | Medida Recomendada | Observações |
| :--- | :--- | :--- | :--- | :--- |
| **Logotipo Oficial** | `logo.tsx`, `Footer.tsx`, `PortariaLoginPage` | **1:1** (Quadrado) | **512 x 512 px** | Formato PNG transparente obrigatório para evitar conflitos de background. |
| **Plano de Fundo (Home)** | `Index.tsx` (`background site.png`) | **16:9** (Widescreen) | **1920 x 1080 px** | Fica com uma sobreposição (overlay) escura e opacidade nativa de 40%. |

## 2. Eventos e Hero Banners
| Localização | Componentes Analisados | Proporção (CSS) | Medida Recomendada | Observações |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Banners (Destaques Home)** | `MasterSiteManagement.tsx` | **16:9** (`aspect-video`) | **1920 x 1080 px** | Área nobre. Use imagens com ponto focal centralizado. O sistema arrendonda as bordas (`rounded-3xl`). |
| **Banner Principal do Evento** | `EventDetailPage.tsx`, `CreateEvent.tsx` | **16:9** (`aspect-video`) | **1280 x 720 px** | Esse é o banner que aparece na página de vendas do ingresso. Ele se restringe a uma largura de até 900px na tela mas cresce em telas maiores. |
| **Galeria de Fotos do Evento** | `GalleryPage.tsx`, `PhotoGrid.tsx` | **1:1** (`aspect-square`) | **800 x 800 px** | As fotos podem ser enviadas em vários tamanhos, mas o grid do site vai fazer um "crop" central cortando em formato perfeitamente quadrado. |
| **Banner de Compartilhamento (Social)**| `SocialShareCard.tsx` | **16:9** (`aspect-video`) | **1200 x 630 px** | Tamanho padrão exigido pelo WhatsApp, Facebook e LinkedIn (Open Graph). |

## 3. Produtores, Staff e Promoters
| Localização | Componentes Analisados | Proporção (CSS) | Medida Recomendada | Observações |
| :--- | :--- | :--- | :--- | :--- |
| **Foto de Perfil / Avatar (Organizer)** | `ProducerFanPage.tsx`, `Avatar.tsx` | **1:1** (`aspect-square`) | **400 x 400 px** | Exibida de forma redonda ou quadrada nas páginas de produtor. |
| **Capa de Perfil do Produtor** | `OrganizerSettings.tsx` | **4:3** (`aspect-[4/3]`) | **800 x 600 px** | Possui uma restrição de aspecto explícita gravada no código. Recomenda-se focar elementos importantes no centro. |
| **Posts do Produtor** | `ProducerFanPage.tsx`, `OrganizerPostManager`| **1:1** ou **16:10** | **800 x 800 px** | Alguns botões de posts no grid usam `aspect-[16/10]`, mas a maioria converge para o quadrado. |

## 4. Publicidade, Popups e QR Codes
| Localização | Componentes Analisados | Proporção (CSS) | Medida Recomendada | Observações |
| :--- | :--- | :--- | :--- | :--- |
| **Popup "Seja Promoter" / Campanhas** | `Index.tsx` (`popup-promoter.png`) | **Livre (Vertical)** | **600 x 800 px** | A altura se adapta automaticamente à largura (`h-auto`). O container chega a 672px (`max-w-2xl`). |
| **Banner Publicitário Horizontal** | `EventDetailPage.tsx` (Bottom Ad) | **4:1** (Super Wide) | **800 x 200 px** | Área de AdSpace (Publicidade Horizontal) reservada explicitly com placeholder de `800x200`. |
| **QR Code (Ingresso/Credencial)** | `WorkerCredentialPage.tsx`, `Checkout` | **1:1** | **200 x 200 px** | Gerados de forma automática via API. O tamanho fixo de renderização é 200x200 pixels. |

---

> [!TIP]
> **Dica de Performance:** Ao instruir organizadores e designers, sempre recomende o envio das imagens em formato **WebP** ou **JPEG comprimido** para as fotos de evento (ideal < 300kb), e limite o uso do PNG apenas para o Logotipo ou imagens que necessitem de fundo transparente. O sistema possui bibliotecas de UI baseadas em CSS (TailwindCSS) que mascaram (escondem) o que estiver fora da proporção exata usando `object-cover`, ou seja, o centro da imagem nunca é distorcido.
