import { Test, TestingModule } from '@nestjs/testing';
import { PeerController } from './peer.controller';
import { PeerService } from '../application/services/peer.service';
import { Peer } from '../domain/entities/peer.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { FirstName } from '../domain/value-objects/firstName.vo';
import { LastName } from '../domain/value-objects/lastName.vo';

const mockPeerService = {
  setupPersonalProfile: jest.fn(),
};

describe('PeerController', () => {
  let app: INestApplication;
  let peerService: typeof mockPeerService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [PeerController],
      providers: [
        {
          provide: PeerService,
          useValue: mockPeerService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    peerService = moduleFixture.get(PeerService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('should return success 201 when sending all data', async () => {
    const mockPeer = new Peer(
        '1',
        new FirstName('Farrel'),
        new LastName('Hardenberg'),
        { getValue: () => 'test@test.com' } as any, { getValue: () => 'http://profile.url' } as any);
    peerService.setupPersonalProfile.mockReturnValue(mockPeer);

    const response = await request(app.getHttpServer())
      .put('/peers')
      .send({
        firstName: 'Farrel',
        lastName: 'Hardenberg',
        email: 'test@test.com',
        profileUrl: 'http://profile.url',
      });

    expect(response.status).toBe(HttpStatus.CREATED);
  });

  it('should return success 201 when sending all data except the profileUrl', async () => {
    const mockPeer = new Peer(
        '1',
        new FirstName('Farrel'),
        new LastName('Hardenberg'),
        { getValue: () => 'test@test.com' } as any);
    peerService.setupPersonalProfile.mockReturnValue(mockPeer);

    const response = await request(app.getHttpServer())
      .post('/peers')
      .send({
        id: '1',
        firstName: 'Farrel',
        lastName: 'Hardenberg',
        email: 'test@test.com',
      });

    expect(response.status).toBe(HttpStatus.CREATED);
  });
});
