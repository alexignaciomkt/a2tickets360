
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, Clock, MapPin, Users, Camera, Save, ArrowLeft } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { organizerService } from '@/services/organizerService';

const eventSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  date: z.string().min(1, 'Data é obrigatória'),
  time: z.string().min(1, 'Horário é obrigatório'),
  duration: z.string().min(1, 'Duração é obrigatória'),
  locationName: z.string().min(1, 'Nome do local é obrigatório'),
  locationAddress: z.string().min(1, 'Endereço é obrigatório'),
  locationCity: z.string().min(1, 'Cidade é obrigatória'),
  locationState: z.string().min(1, 'Estado é obrigatório'),
  locationPostalCode: z.string().min(1, 'CEP é obrigatório'),
  capacity: z.number().min(1, 'Capacidade deve ser maior que 0'),
  imageUrl: z.string().url('URL da imagem inválida').optional().or(z.literal('')),
});

type EventFormData = z.infer<typeof eventSchema>;

const CreateEvent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      date: '',
      time: '',
      duration: '',
      locationName: '',
      locationAddress: '',
      locationCity: '',
      locationState: '',
      locationPostalCode: '',
      capacity: 0,
      imageUrl: '',
    },
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      form.setValue('imageUrl', url); // Mocking upload by using blob URL
    }
  };

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    try {
      const eventData = {
        title: data.title,
        description: data.description,
        category: data.category,
        date: data.date,
        time: data.time,
        duration: data.duration,
        location: {
          name: data.locationName,
          address: data.locationAddress,
          city: data.locationCity,
          state: data.locationState,
          postalCode: data.locationPostalCode,
          coordinates: { lat: -23.2237, lng: -45.9009 }, // Mock coordinates
        },
        capacity: data.capacity,
        status: 'draft' as const,
        imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
        organizerId: '1', // Em uma aplicação real, viria do contexto de autenticação
        organizerName: 'Produções Culturais',
        tickets: [],
        salesChannels: [],
      };

      const newEvent = await organizerService.createEvent(eventData);

      toast({
        title: 'Evento criado com sucesso!',
        description: 'Agora você pode configurar os ingressos e canais de venda.',
      });

      navigate(`/organizer/events/${newEvent.id}/edit`);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar evento',
        description: 'Tente novamente mais tarde.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout userType="organizer">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/organizer/events')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Criar Novo Evento</h1>
            <p className="text-gray-600 mt-1">Preencha as informações básicas do seu evento</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Save className="h-5 w-5 mr-2" />
                Informações Básicas
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título do Evento</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Festival de Música Eletrônica" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva seu evento de forma atrativa..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Música">Música</SelectItem>
                          <SelectItem value="Teatro">Teatro</SelectItem>
                          <SelectItem value="Dança">Dança</SelectItem>
                          <SelectItem value="Festival">Festival</SelectItem>
                          <SelectItem value="Conferência">Conferência</SelectItem>
                          <SelectItem value="Workshop">Workshop</SelectItem>
                          <SelectItem value="Esportes">Esportes</SelectItem>
                          <SelectItem value="Gastronomia">Gastronomia</SelectItem>
                          <SelectItem value="Arte">Arte</SelectItem>
                          <SelectItem value="Outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>
            </div>

            {/* Imagens */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Camera className="h-5 w-5 mr-2" />
                Banner do Evento
              </h2>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  {previewUrl ? (
                    <div className="relative h-64 w-full">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="h-full w-full object-cover rounded-md"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-md">
                        <p className="text-white font-medium">Clique para alterar</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center mb-4 text-indigo-600">
                        <Camera className="h-6 w-6" />
                      </div>
                      <p className="text-lg font-medium text-gray-900">Clique para fazer upload da imagem</p>
                      <p className="text-sm text-gray-500 mt-1">PNG, JPG ou WEBP (Max. 5MB)</p>
                      <p className="text-sm font-semibold text-indigo-600 mt-2">Dimensão recomendada: 1920x1080 (16:9)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Data e Horário
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 4 horas" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Localização
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="locationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Local</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Centro de Convenções" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacidade Total</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ex: 1000"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="locationAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Av. Principal, 1000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="locationCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: São José dos Campos" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="locationState"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: SP" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="locationPostalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 12345-000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/organizer/events')}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Criando...' : 'Criar Evento'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout >
  );
};

export default CreateEvent;
