import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getAuthToken, createOrder } from './helpers/test-utils';

describe('Drones (e2e)', () => {
  let app: INestApplication;
  let droneToken: string;
  let enduserToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    droneToken = await getAuthToken(app, 'Test Drone Beta', 'DRONE');
    enduserToken = await getAuthToken(app, 'Drone Test User', 'ENDUSER');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /drones/reserve-job', () => {
    it('should reserve available job', async () => {
      
      await createOrder(app, enduserToken);

      return request(app.getHttpServer())
        .post('/drones/reserve-job')
        .set('Authorization', `Bearer ${droneToken}`)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body).toHaveProperty('order');
          expect(res.body.order.status).toBe('ASSIGNED');
        });
    });

    it('should return no jobs when none available', async () => {
      const newDroneToken = await getAuthToken(app, 'Empty Drone', 'DRONE');

      return request(app.getHttpServer())
        .post('/drones/reserve-job')
        .set('Authorization', `Bearer ${newDroneToken}`)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.message).toContain('No available');
        });
    });

    it('should reject non-drone users', async () => {
      return request(app.getHttpServer())
        .post('/drones/reserve-job')
        .set('Authorization', `Bearer ${enduserToken}`)
        .expect(403);
    });
  });

  describe('POST /drones/grab-order', () => {
    it('should pickup assigned order', async () => {
      const testDrone = await getAuthToken(app, 'Grab Drone', 'DRONE');
      const testUser = await getAuthToken(app, 'Grab User', 'ENDUSER');

      const order = await createOrder(app, testUser);

      
      await request(app.getHttpServer())
        .post('/drones/reserve-job')
        .set('Authorization', `Bearer ${testDrone}`);

      
      return request(app.getHttpServer())
        .post('/drones/grab-order')
        .set('Authorization', `Bearer ${testDrone}`)
        .send({ orderId: order.id })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.order.status).toBe('PICKED_UP');
        });
    });

    it('should reject grabbing unassigned order', async () => {
      const testDrone = await getAuthToken(app, 'Reject Drone', 'DRONE');
      const testUser = await getAuthToken(app, 'Reject User', 'ENDUSER');

      const order = await createOrder(app, testUser);

      return request(app.getHttpServer())
        .post('/drones/grab-order')
        .set('Authorization', `Bearer ${testDrone}`)
        .send({ orderId: order.id })
        .expect(400);
    });
  });

  describe('POST /drones/heartbeat', () => {
    it('should update drone location', async () => {
      const testDrone = await getAuthToken(app, 'Heartbeat Drone', 'DRONE');

      return request(app.getHttpServer())
        .post('/drones/heartbeat')
        .set('Authorization', `Bearer ${testDrone}`)
        .send({
          lat: 40.7300,
          lng: -74.0100,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.drone.currentLat).toBe(40.7300);
          expect(res.body.drone.currentLng).toBe(-74.0100);
        });
    });

    it('should validate coordinates', () => {
      return request(app.getHttpServer())
        .post('/drones/heartbeat')
        .set('Authorization', `Bearer ${droneToken}`)
        .send({
          lat: 200, 
          lng: -74.0100,
        })
        .expect(400);
    });
  });

  describe('POST /drones/mark-delivered', () => {
    it('should mark order as delivered', async () => {
      const timestamp = Date.now();
      const testDrone = await getAuthToken(app, `DeliverD${timestamp}`, 'DRONE');
      const testUser = await getAuthToken(app, `DeliverU${timestamp}`, 'ENDUSER');

      const order = await createOrder(app, testUser);

      
      await request(app.getHttpServer())
        .post('/drones/reserve-job')
        .set('Authorization', `Bearer ${testDrone}`);

      await request(app.getHttpServer())
        .post('/drones/grab-order')
        .set('Authorization', `Bearer ${testDrone}`)
        .send({ orderId: order.id });

      
      return request(app.getHttpServer())
        .post('/drones/mark-delivered')
        .set('Authorization', `Bearer ${testDrone}`)
        .send({ orderId: order.id })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });
  });

  describe('POST /drones/mark-failed', () => {
    it('should mark order as failed', async () => {
      const timestamp = Date.now();
      const testDrone = await getAuthToken(app, `FailD${timestamp}`, 'DRONE');
      const testUser = await getAuthToken(app, `FailU${timestamp}`, 'ENDUSER');

      const order = await createOrder(app, testUser);

      
      await request(app.getHttpServer())
        .post('/drones/reserve-job')
        .set('Authorization', `Bearer ${testDrone}`)
        .expect(201);

      
      await request(app.getHttpServer())
        .post('/drones/grab-order')
        .set('Authorization', `Bearer ${testDrone}`)
        .send({ orderId: order.id })
        .expect(201);

      
      return request(app.getHttpServer())
        .post('/drones/mark-failed')
        .set('Authorization', `Bearer ${testDrone}`)
        .send({
          orderId: order.id,
          reason: 'Weather conditions',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });
  });

  describe('POST /drones/mark-broken (Critical Handoff)', () => {
    it('should create handoff when drone breaks with order', async () => {
      const timestamp = Date.now();
      const testDrone = await getAuthToken(app, `BrokenD${timestamp}`, 'DRONE');
      const testUser = await getAuthToken(app, `BrokenU${timestamp}`, 'ENDUSER');

      const order = await createOrder(app, testUser);

      
      await request(app.getHttpServer())
        .post('/drones/reserve-job')
        .set('Authorization', `Bearer ${testDrone}`)
        .expect(201);

      
      await request(app.getHttpServer())
        .post('/drones/grab-order')
        .set('Authorization', `Bearer ${testDrone}`)
        .send({ orderId: order.id })
        .expect(201);

      
      return request(app.getHttpServer())
        .post('/drones/mark-broken')
        .set('Authorization', `Bearer ${testDrone}`)
        .send({ reason: 'Battery failure' })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.message).toContain('handoff');
        });
    });

    it('should allow another drone to pickup handoff order', async () => {
      const timestamp = Date.now();
      const drone1 = await getAuthToken(app, `Handoff1D${timestamp}`, 'DRONE');
      const drone2 = await getAuthToken(app, `Handoff2D${timestamp}`, 'DRONE');
      const testUser = await getAuthToken(app, `HandoffU${timestamp}`, 'ENDUSER');

      const order = await createOrder(app, testUser);

      
      await request(app.getHttpServer())
        .post('/drones/reserve-job')
        .set('Authorization', `Bearer ${drone1}`)
        .expect(201);

      await request(app.getHttpServer())
        .post('/drones/grab-order')
        .set('Authorization', `Bearer ${drone1}`)
        .send({ orderId: order.id })
        .expect(201);

      await request(app.getHttpServer())
        .post('/drones/mark-broken')
        .set('Authorization', `Bearer ${drone1}`)
        .send({ reason: 'Battery dead' })
        .expect(201);

      
      return request(app.getHttpServer())
        .post('/drones/reserve-job')
        .set('Authorization', `Bearer ${drone2}`)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.order.status).toBe('ASSIGNED');
        });
    });
  });

  describe('GET /drones/current-order', () => {
    it('should get current order details', async () => {
      const timestamp = Date.now();
      const testDrone = await getAuthToken(app, `CurrentD${timestamp}`, 'DRONE');
      const testUser = await getAuthToken(app, `CurrentU${timestamp}`, 'ENDUSER');

      await createOrder(app, testUser);

      await request(app.getHttpServer())
        .post('/drones/reserve-job')
        .set('Authorization', `Bearer ${testDrone}`);

      return request(app.getHttpServer())
        .get('/drones/current-order')
        .set('Authorization', `Bearer ${testDrone}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.hasOrder).toBe(true);
          expect(res.body.order).toBeDefined();
        });
    });

    it('should return no order when none assigned', async () => {
      const testDrone = await getAuthToken(app, 'No Order Drone', 'DRONE');

      return request(app.getHttpServer())
        .get('/drones/current-order')
        .set('Authorization', `Bearer ${testDrone}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.hasOrder).toBe(false);
        });
    });
  });
});
