import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.SUPABASE_URL || 'https://uwgazmeppbvjvhejrdgx.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3Z2F6bWVwcGJ2anZoZWpyZGd4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTY5MTQxNiwiZXhwIjoyMDkxMjY3NDE2fQ.HFHEsZCNRgWEGziDZ_9aTj24cDc7viAHGSCupxzN7jc';

const supabase = createClient(supabaseUrl, supabaseKey);

(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = req.path || '/';
  const method = req.method;
  
  const corsOrigins = [
    'http://localhost:5173', 
    'http://localhost:3000', 
    'https://delivr-frontend.vercel.app',
    'https://delivr-git-main-michaelmariano3.vercel.app',
    'https://delivr-5x15-git-main-michaelmariano3.vercel.app'
  ];
  
  const origin = req.headers.origin;
  const isAllowed = origin && (
    corsOrigins.includes(origin) || 
    origin.endsWith('.vercel.app') ||
    origin.includes('vercel.app')
  );
  
  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (method === 'OPTIONS') {
    return res.status(200).send('');
  }

  try {
    if (path === '/health' || path === '/api/health') {
      return res.json({ status: 'ok' });
    }

    if (path === '/login' || path === '/api/login') {
      if (method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
      
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
      }
      
      const crypto = await import('crypto');
      const hashedPassword = crypto.createHash('sha256').update(password + 'delivr_salt_2024').digest('hex');
      
      const sanitized = username.replace(/[<>\"'&]/g, '').trim();
      
      const { data: user, error } = await supabase
        .from('users')
        .select('id, username, role, status, name, avatar, password')
        .eq('username', sanitized)
        .single();

      if (error || !user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }
      
      if (user.password !== hashedPassword) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      if (user.status === 'pending') {
        return res.status(403).json({ error: 'Cadastro pendente de aprovação' });
      }
      return res.json(user);
    }

    if (path === '/register' || path === '/api/register') {
      if (method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
      
      const { username, password, name, role, id_document, selfie, phone, cpf } = req.body;
      
      if (!username || !password || !name) {
        return res.status(400).json({ error: 'Nome, usuário e senha são obrigatórios' });
      }
      
      if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
        return res.status(400).json({ error: 'Nome de usuário deve ter 3-30 caracteres' });
      }
      
      if (password.length < 6) {
        return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
      }
      
      const status = role === 'client' ? 'pending' : 'approved';
      const crypto = await import('crypto');
      const hashedPassword = crypto.createHash('sha256').update(password + 'delivr_salt_2024').digest('hex');
      
      const sanitizeInput = (input: string) => input.replace(/[<>\"'&]/g, '').trim();
      
      const { data, error } = await supabase
        .from('users')
        .insert({ 
          username: sanitizeInput(username), 
          password: hashedPassword, 
          role, 
          status, 
          name: sanitizeInput(name), 
          id_document: id_document || null, 
          selfie: selfie || null, 
          phone: phone ? sanitizeInput(phone) : null, 
          cpf: cpf ? sanitizeInput(cpf) : null 
        })
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          return res.status(400).json({ error: 'Nome de usuário já existe' });
        }
        return res.status(400).json({ error: 'Erro no cadastro' });
      }
      return res.json({ id: data.id, status });
    }

    if (path === '/restaurants' || path === '/api/restaurants') {
      if (method !== 'GET' && method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
      
      if (method === 'GET') {
        const { data: restaurants } = await supabase.from('restaurants').select('*');
        return res.json(restaurants || []);
      }
      
      if (method === 'POST') {
        const { userId, name, address, category, delivery_type, lat, lng } = req.body;
        const { data, error } = await supabase
          .from('restaurants')
          .insert({ userId, name, address, category, delivery_type: delivery_type || 'platform', lat: lat || 0, lng: lng || 0 })
          .select()
          .single();
        if (error) throw error;
        return res.json({ id: data.id });
      }
    }

    if (path.startsWith('/restaurants/') && path.includes('/menu')) {
      const restaurantId = path.split('/')[2];
      if (method === 'GET') {
        const { data: menu } = await supabase.from('menu_items').select('*').eq('restaurantId', restaurantId);
        return res.json(menu || []);
      }
      if (method === 'POST') {
        const { name, description, price, image } = req.body;
        const { data, error } = await supabase
          .from('menu_items')
          .insert({ restaurantId, name, description, price, image })
          .select()
          .single();
        if (error) throw error;
        return res.json({ id: data.id });
      }
    }

    if (path === '/orders' || path === '/api/orders') {
      if (method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
      
      const { clientId, restaurantId, items, totalPrice, deliveryFee, distance, lat, lng, address } = req.body;
      
      const { data: client } = await supabase.from('users').select('status').eq('id', clientId).single();
      if (!client || client.status !== 'approved') {
        return res.status(403).json({ error: 'Sua conta ainda não foi aprovada pelo administrador.' });
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({ 
          clientId, restaurantId, status: 'pending', total_price: totalPrice, 
          delivery_fee: deliveryFee || 0, distance: distance || 0, 
          client_lat: lat, client_lng: lng, address 
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item: any) => ({
        orderId: order.id,
        menuItemId: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      await supabase.from('order_items').insert(orderItems);
      return res.json({ orderId: order.id });
    }

    if (path.startsWith('/orders/client/')) {
      const clientId = path.split('/')[3];
      if (method === 'GET') {
        const { data: orders } = await supabase
          .from('orders')
          .select(`
            *,
            restaurants (name, lat, lng, delivery_type)
          `)
          .eq('clientId', clientId)
          .order('created_at', { ascending: false });
        
        const formatted = (orders || []).map((o: any) => ({
          ...o,
          restaurantName: o.restaurants?.name,
          restaurantLat: o.restaurants?.lat,
          restaurantLng: o.restaurants?.lng,
          delivery_type: o.restaurants?.delivery_type
        }));

        return res.json(formatted);
      }
    }

    if (path.startsWith('/orders/restaurant/')) {
      const userId = path.split('/')[3];
      if (method === 'GET') {
        const { data: restaurant } = await supabase.from('restaurants').select('id').eq('userId', userId).single();
        if (!restaurant) return res.json([]);

        const { data: orders } = await supabase
          .from('orders')
          .select('*, users!orders_clientId_fkey (name)')
          .eq('restaurantId', restaurant.id)
          .order('created_at', { ascending: false });

        const formatted = (orders || []).map((o: any) => ({
          ...o,
          clientName: o.users?.name
        }));

        return res.json(formatted);
      }
    }

    if (path.startsWith('/orders/driver/available')) {
      if (method === 'GET') {
        const { data: orders } = await supabase
          .from('orders')
          .select(`
            *, 
            restaurants (name, address, delivery_type)
          `)
          .eq('status', 'preparing')
          .is('driverId', null);
        
        const filtered = (orders || []).filter((o: any) => o.restaurants?.delivery_type === 'platform');
        const formatted = filtered.map((o: any) => ({
          ...o,
          restaurantName: o.restaurants?.name,
          restaurantAddress: o.restaurants?.address
        }));

        return res.json(formatted);
      }
    }

    if (path.startsWith('/orders/driver/') && path.includes('/active')) {
      const driverId = path.split('/')[3];
      if (method === 'GET') {
        const { data: order } = await supabase
          .from('orders')
          .select(`
            *, 
            restaurants (name, address, lat, lng),
            users!orders_clientId_fkey (name)
          `)
          .eq('driverId', driverId)
          .eq('status', 'out_for_delivery')
          .single();
        
        if (!order) return res.json(null);

        const formatted = {
          ...order,
          restaurantName: order.restaurants?.name,
          restaurantAddress: order.restaurants?.address,
          restaurantLat: order.restaurants?.lat,
          restaurantLng: order.restaurants?.lng,
          clientName: order.users?.name
        };

        return res.json(formatted);
      }
    }

    if (path.startsWith('/orders/') && path.endsWith('/status')) {
      const orderId = path.split('/')[2];
      if (method === 'POST') {
        const { status, driverId } = req.body;
        const updateData: any = { status };
        if (driverId) updateData.driverId = driverId;

        await supabase.from('orders').update(updateData).eq('id', orderId);
        return res.json({ success: true });
      }
    }

    if (path.startsWith('/admin/')) {
      return await handleAdminRoutes(req, res, path, method, supabase);
    }

    if (path.startsWith('/stats/')) {
      return await handleStatsRoutes(req, res, path, method, supabase);
    }

    if (path.startsWith('/payment/')) {
      return await handlePaymentRoutes(req, res, path, method, supabase);
    }

    if (path.startsWith('/users/')) {
      return await handleUserRoutes(req, res, path, method, supabase);
    }

    if (path.startsWith('/restaurants/') && path.includes('/settings')) {
      const restaurantId = path.split('/')[2];
      if (method === 'POST') {
        const { delivery_type } = req.body;
        await supabase.from('restaurants').update({ delivery_type }).eq('id', restaurantId);
        return res.json({ success: true });
      }
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleAdminRoutes(req: VercelRequest, res: VercelResponse, path: string, method: string, supabase: any) {
  if (path === '/admin/pending-clients' || path === '/api/admin/pending-clients') {
    if (method === 'GET') {
      const { data: clients } = await supabase
        .from('users')
        .select('id, username, name, role, status, id_document, selfie')
        .eq('role', 'client')
        .eq('status', 'pending');
      return res.json(clients || []);
    }
  }

  if (path === '/admin/restaurants' || path === '/api/admin/restaurants') {
    if (method === 'GET') {
      const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select(`
          id, userId, name, address, category, delivery_type, lat, lng,
          users (name, username, phone, cpf, avatar)
        `)
        .order('id', { ascending: false });

      if (error) throw error;

      const formatted = restaurants.map((r: any) => ({
        ...r,
        ownerName: r.users?.name,
        ownerUsername: r.users?.username,
        phone: r.users?.phone,
        cpf: r.users?.cpf,
        ownerAvatar: r.users?.avatar
      }));

      return res.json(formatted);
    }
  }

  if (path === '/admin/drivers' || path === '/api/admin/drivers') {
    if (method === 'GET') {
      const { data: drivers } = await supabase
        .from('users')
        .select('id, username, name, phone, cpf, status, avatar, id_document, selfie')
        .eq('role', 'driver')
        .order('id', { ascending: false });
      return res.json(drivers || []);
    }
  }

  if (path === '/admin/clients' || path === '/api/admin/clients') {
    if (method === 'GET') {
      const { data: clients } = await supabase
        .from('users')
        .select('id, username, name, phone, cpf, status, avatar, id_document, selfie')
        .eq('role', 'client')
        .order('id', { ascending: false });
      return res.json(clients || []);
    }
  }

  if (path === '/admin/approve-client' || path === '/api/admin/approve-client') {
    if (method === 'POST') {
      const { userId } = req.body;
      await supabase.from('users').update({ status: 'approved' }).eq('id', userId);
      return res.json({ success: true });
    }
  }

  if (path === '/admin/stats' || path === '/api/admin/stats') {
    if (method === 'GET') {
      const { data: restaurantStats } = await supabase
        .from('orders')
        .select('restaurantId, total_price, restaurants!inner(id, name)')
        .eq('status', 'delivered');

      const { data: driverStats } = await supabase
        .from('orders')
        .select('driverId, users!inner(id, name)')
        .eq('status', 'delivered');

      const rStats = (restaurantStats || []).reduce((acc: any, curr: any) => {
        const id = curr.restaurants.id;
        if (!acc[id]) acc[id] = { id, name: curr.restaurants.name, total_earnings: 0 };
        acc[id].total_earnings += curr.total_price;
        return acc;
      }, {});

      const dStats = (driverStats || []).reduce((acc: any, curr: any) => {
        const id = curr.users.id;
        if (!acc[id]) acc[id] = { id, name: curr.users.name, total_deliveries: 0 };
        acc[id].total_deliveries += 1;
        return acc;
      }, {});

  return res.json({ 
    restaurantStats: Object.values(rStats), 
    driverStats: Object.values(dStats) 
  });
  }

  if ((path.startsWith('/admin/users/') && path.endsWith('/password')) || (path.startsWith('/api/admin/users/') && path.includes('/password'))) {
    const userId = path.split('/')[3];
    if (method === 'PUT') {
      const { password } = req.body;
      if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
      }
      const crypto = await import('crypto');
      const hashedPassword = crypto.createHash('sha256').update(password + 'delivr_salt_2024').digest('hex');
      await supabase.from('users').update({ password: hashedPassword }).eq('id', userId);
      return res.json({ success: true });
    }
  }

  if (path.startsWith('/admin/restaurants/') && !path.includes('/menu') && !path.includes('/settings')) {
    const restaurantId = path.split('/')[3];
    
    if (method === 'PUT') {
      const { name, address, category, delivery_type, ownerName, phone, cpf } = req.body;
      try {
        const { data: restaurant } = await supabase.from('restaurants').select('userId').eq('id', restaurantId).single();
        if (!restaurant) return res.status(404).json({ error: 'Restaurante não encontrado' });

        await supabase.from('restaurants').update({ name, address, category, delivery_type }).eq('id', restaurantId);
        await supabase.from('users').update({ name: ownerName, phone, cpf }).eq('id', restaurant.userId);

        return res.json({ success: true });
      } catch (e) {
        return res.status(500).json({ error: 'Erro ao atualizar restaurante' });
      }
    }

    if (method === 'DELETE') {
      try {
        const { data: restaurant } = await supabase.from('restaurants').select('userId').eq('id', restaurantId).single();
        if (restaurant) {
          const { data: orders } = await supabase.from('orders').select('id').eq('restaurantId', restaurantId);
          const orderIds = (orders || []).map((o: any) => o.id);

          if (orderIds.length > 0) {
            await supabase.from('order_items').delete().in('orderId', orderIds);
            await supabase.from('orders').delete().in('id', orderIds);
          }
          
          await supabase.from('menu_items').delete().eq('restaurantId', restaurantId);
          await supabase.from('restaurants').delete().eq('id', restaurantId);
          
          await supabase.from('orders').update({ clientId: null }).eq('clientId', restaurant.userId);
          await supabase.from('orders').update({ driverId: null }).eq('driverId', restaurant.userId);
          await supabase.from('users').delete().eq('id', restaurant.userId);
        }
        return res.json({ success: true });
      } catch (e) {
        return res.status(500).json({ error: 'Erro ao excluir restaurante' });
      }
    }

    if (path.endsWith('/reject') && method === 'POST') {
      try {
        const { data: restaurant } = await supabase.from('restaurants').select('userId').eq('id', restaurantId).single();
        if (restaurant) {
          await supabase.from('users').update({ status: 'pending' }).eq('id', restaurant.userId);
        }
        return res.json({ success: true });
      } catch (e) {
        return res.status(500).json({ error: 'Erro ao rejeitar restaurante' });
      }
    }
  }

  if (path.startsWith('/admin/drivers/')) {
    const userId = path.split('/')[3];
    
    if (method === 'PUT') {
      const { name, phone, cpf, status } = req.body;
      try {
        await supabase.from('users').update({ name, phone, cpf, status: status || 'approved' }).eq('id', userId);
        return res.json({ success: true });
      } catch (e) {
        return res.status(500).json({ error: 'Erro ao atualizar entregador' });
      }
    }

    if (method === 'DELETE') {
      try {
        await supabase.from('orders').update({ driverId: null }).eq('driverId', userId);
        await supabase.from('orders').update({ clientId: null }).eq('clientId', userId);
        await supabase.from('users').delete().eq('id', userId);
        return res.json({ success: true });
      } catch (e) {
        return res.status(500).json({ error: 'Erro ao excluir entregador' });
      }
    }

    if (path.endsWith('/reject') && method === 'POST') {
      try {
        await supabase.from('users').update({ status: 'pending' }).eq('id', userId);
        return res.json({ success: true });
      } catch (e) {
        return res.status(500).json({ error: 'Erro ao rejeitar entregador' });
      }
    }
  }

  if (path.startsWith('/admin/clients/')) {
    const userId = path.split('/')[3];
    
    if (method === 'PUT') {
      const { name, phone, cpf, status } = req.body;
      try {
        await supabase.from('users').update({ name, phone, cpf, status }).eq('id', userId);
        return res.json({ success: true });
      } catch (e) {
        return res.status(500).json({ error: 'Erro ao atualizar cliente' });
      }
    }
  }

  return res.status(404).json({ error: 'Admin route not found' });
}

async function handleStatsRoutes(req: VercelRequest, res: VercelResponse, path: string, method: string, supabase: any) {
  if (path.startsWith('/stats/restaurant/')) {
    const userId = path.split('/')[3];
    
    const { data: restaurant } = await supabase.from('restaurants').select('id').eq('userId', userId).single();
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

    const { data: orders } = await supabase
      .from('orders')
      .select('total_price, delivery_fee, created_at')
      .eq('restaurantId', restaurant.id)
      .eq('status', 'delivered');

    const gross = (orders || []).reduce((sum: number, o: any) => sum + o.total_price, 0);
    const net = (orders || []).reduce((sum: number, o: any) => sum + (o.total_price - (o.delivery_fee || 0)) * 0.87, 0);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const daily = (orders || [])
      .filter((o: any) => new Date(o.created_at) >= sevenDaysAgo)
      .reduce((acc: any, o: any) => {
        const day = new Date(o.created_at).toISOString().split('T')[0];
        if (!acc[day]) acc[day] = { day, count: 0, gross: 0 };
        acc[day].count += 1;
        acc[day].gross += o.total_price;
        return acc;
      }, {});

    return res.json({
      gross,
      net,
      count: (orders || []).length,
      daily: Object.values(daily).sort((a: any, b: any) => a.day.localeCompare(b.day))
    });
  }

  if (path.startsWith('/stats/driver/')) {
    const userId = parseInt(path.split('/')[3]);
    
    const { data: orders } = await supabase
      .from('orders')
      .select('delivery_fee')
      .eq('driverId', userId)
      .eq('status', 'delivered');
    
    const earnings = (orders || []).reduce((sum: number, o: any) => sum + (o.delivery_fee || 0), 0);
    
    return res.json({
      count: (orders || []).length,
      earnings
    });
  }

  return res.status(404).json({ error: 'Stats route not found' });
}

async function handlePaymentRoutes(req: VercelRequest, res: VercelResponse, path: string, method: string, supabase: any) {
  if ((path === '/payment/pix' || path === '/api/payment/pix') && method === 'POST') {
    const { clientId, restaurantId, items, totalPrice, deliveryFee, distance, lat, lng, address } = req.body;

    const { data: client } = await supabase.from('users').select('name, phone, cpf, status').eq('id', clientId).single();
    if (!client || client.status !== 'approved') {
      return res.status(403).json({ error: 'Sua conta ainda não foi aprovada.' });
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({ 
        clientId, restaurantId, status: 'pending', total_price: totalPrice, 
        delivery_fee: deliveryFee || 0, distance: distance || 0, 
        client_lat: lat || 0, client_lng: lng || 0, address, payment_status: 'awaiting_payment' 
      })
      .select()
      .single();
    
    if (orderError) throw orderError;
    const orderId = order.id;

    const orderItems = items.map((item: any) => ({
      orderId: orderId,
      menuItemId: item.id,
      quantity: item.quantity,
      price: item.price
    }));
    await supabase.from('order_items').insert(orderItems);

    const amountInCents = Math.round(totalPrice * 100);
    const apiKey = process.env.ABACATEPAY_API_KEY || '';

    const payload = {
      amount: amountInCents,
      description: `Pedido DelivR #${orderId}`,
      expiresIn: 600,
      customer: {
        name: client.name || 'Cliente DelivR',
        email: 'cliente@delivr.app',
        taxId: (client.cpf || '00000000000').replace(/\D/g, ''),
        cellphone: (client.phone || '11999999999').replace(/\D/g, '')
      }
    };

    try {
      const resAbacate = await fetch('https://api.abacatepay.com/v1/pixQrCode/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await resAbacate.json();

      if (!resAbacate.ok) {
        const QRCode = (await import('qrcode')).default;
        const mockPixText = `00020126440014br.gov.bcb.pix0122mockpix@delivr.app5204000053039865802BR5916DelivR Delivery6009Sao Paulo62290525MockPixOrder${orderId}63041A2B`;
        const qrCodeBase64 = await QRCode.toDataURL(mockPixText, { width: 300, margin: 2 });
        return res.json({ orderId, paymentId: 'mock_abacate_id', pixText: mockPixText, qrCodeBase64, isMock: true });
      }

      const paymentId = data.data?.id || '';
      const pixText = data.data?.brCode || '';
      const brCodeBase64 = data.data?.brCodeBase64 || '';

      await supabase.from('orders').update({ payment_id: paymentId }).eq('id', orderId);

      let qrCodeBase64 = '';
      if (brCodeBase64) {
        qrCodeBase64 = brCodeBase64.startsWith('data:')
          ? brCodeBase64
          : `data:image/png;base64,${brCodeBase64}`;
      }

      return res.json({ orderId, paymentId, pixText, qrCodeBase64 });
    } catch (err) {
      const QRCode = (await import('qrcode')).default;
      const mockPixText = `00020126440014br.gov.bcb.pix0122mockpix@delivr.app5204000053039865802BR5916DelivR Delivery6009Sao Paulo62290525MockPixOrder${orderId}63041A2B`;
      const qrCodeBase64 = await QRCode.toDataURL(mockPixText, { width: 300, margin: 2 });
      return res.json({ orderId, paymentId: 'mock_abacate_id', pixText: mockPixText, qrCodeBase64, isMock: true });
    }
  }

  if ((path === '/payment/checkout' || path === '/api/payment/checkout') && method === 'POST') {
    const { clientId, restaurantId, items, totalPrice, deliveryFee, distance, lat, lng, address, method: payMethod } = req.body;

    const { data: client } = await supabase.from('users').select('status').eq('id', clientId).single();
    if (!client || client.status !== 'approved') {
      return res.status(403).json({ error: 'Sua conta ainda não foi aprovada.' });
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({ 
        clientId, restaurantId, status: 'pending', total_price: totalPrice, 
        delivery_fee: deliveryFee || 0, distance: distance || 0, 
        client_lat: lat || 0, client_lng: lng || 0, address, payment_status: `${payMethod}_at_door` 
      })
      .select()
      .single();
    
    if (orderError) throw orderError;
    const orderId = order.id;

    const orderItems = items.map((item: any) => ({
      orderId: orderId,
      menuItemId: item.id,
      quantity: item.quantity,
      price: item.price
    }));
    await supabase.from('order_items').insert(orderItems);

    return res.json({ orderId, success: true });
  }

  if (path.startsWith('/payment/status/')) {
    const orderId = path.split('/')[3];
    if (method === 'GET') {
      const { data: order } = await supabase.from('orders').select('payment_id, payment_status').eq('id', orderId).single();
      if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });
      if (order.payment_status === 'paid') return res.json({ status: 'paid' });
      if (!order.payment_id || order.payment_id.startsWith('mock_')) return res.json({ status: 'awaiting_payment' });

      try {
        const apiKey = process.env.ABACATEPAY_API_KEY || '';
        const resAbacate = await fetch(`https://api.abacatepay.com/v1/pixQrCode/check?id=${order.payment_id}`, {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        const data = await resAbacate.json();
        const status = data.data?.status || '';
        if (status === 'PAID' || status === 'paid') {
          await supabase.from('orders').update({ payment_status: 'paid' }).eq('id', orderId);
          return res.json({ status: 'paid' });
        }
        return res.json({ status: 'awaiting_payment' });
      } catch {
        return res.json({ status: order.payment_status || 'awaiting_payment' });
      }
    }
  }

  if ((path === '/payment/webhook' || path === '/api/payment/webhook') && method === 'POST') {
    const event = req.body;

    if (event.event === 'billing.paid') {
      const abacateId = event.data?.id;
      if (abacateId) {
        const { data: localOrder } = await supabase.from('orders').select('id').eq('payment_id', abacateId).single();
        if (localOrder) {
          await supabase.from('orders').update({ payment_status: 'paid' }).eq('id', localOrder.id);
        }
      }
    }
    return res.sendStatus(200);
  }

  return res.status(404).json({ error: 'Payment route not found' });
}

async function handleUserRoutes(req: VercelRequest, res: VercelResponse, path: string, method: string, supabase: any) {
  const userId = path.split('/')[2];

  if (path.endsWith('/info') && method === 'POST') {
    const { cpf, phone } = req.body;
    try {
      await supabase.from('users').update({ cpf, phone }).eq('id', userId);
      return res.json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: 'Erro ao atualizar dados' });
    }
  }

  if (path.endsWith('/avatar') && method === 'POST') {
    const { avatar } = req.body;
    try {
      await supabase.from('users').update({ avatar }).eq('id', userId);
      return res.json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: 'Erro ao salvar avatar' });
    }
  }

  return res.status(404).json({ error: 'User route not found' });
}
