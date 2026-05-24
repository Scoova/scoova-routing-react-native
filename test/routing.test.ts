import { RoutingClient, RoutingError, decodePolyline } from '../src/index';

const okTrip = {
  trip: { legs: [], summary: { length: 0, time: 0 }, status: 0, status_message: 'OK', units: 'kilometers' },
};

function mockFetch(payload: unknown = okTrip, status = 200) {
  return jest.fn(async () => new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })) as unknown as typeof fetch;
}

describe('RoutingClient', () => {
  it('hits POST /route with sane defaults', async () => {
    const fetchImpl = mockFetch();
    const client = new RoutingClient({ baseUrl: 'https://example.test', fetch: fetchImpl });
    await client.route([{ lat: 30, lon: 31 }, { lat: 31, lon: 32 }]);
    const calls = (fetchImpl as unknown as jest.Mock).mock.calls;
    expect(String(calls[0][0])).toContain('https://example.test/route');
    expect(String(calls[0][0])).toContain('locale=en');
    expect(calls[0][1].method).toBe('POST');
    expect(calls[0][1].headers['Accept-Language']).toBe('en');
    const body = JSON.parse(calls[0][1].body);
    expect(body.locations).toHaveLength(2);
    expect(body.costing).toBe('scooter');
    expect(body.directions_options.language).toBe('en');
  });

  it('respects costing + language + alternates', async () => {
    const fetchImpl = mockFetch();
    const client = new RoutingClient({ baseUrl: 'https://example.test', fetch: fetchImpl });
    await client.route([{ lat: 30, lon: 31 }, { lat: 31, lon: 32 }], {
      costing: 'pedestrian', language: 'ar-EG', alternates: 2, simplifiedInstructions: true,
    });
    const body = JSON.parse((fetchImpl as unknown as jest.Mock).mock.calls[0][1].body);
    expect(body.costing).toBe('pedestrian');
    expect(body.directions_options.language).toBe('ar-EG');
    expect(body.alternates).toBe(2);
    expect(body.simplified_instructions).toBe(true);
  });

  it('client-level locale flows into URL + header + directions_options', async () => {
    const fetchImpl = mockFetch();
    const client = new RoutingClient({ baseUrl: 'https://example.test', fetch: fetchImpl, locale: 'fr' });
    await client.route([{ lat: 30, lon: 31 }, { lat: 31, lon: 32 }]);
    const call = (fetchImpl as unknown as jest.Mock).mock.calls[0];
    expect(String(call[0])).toContain('locale=fr');
    expect(call[1].headers['Accept-Language']).toBe('fr');
    const body = JSON.parse(call[1].body);
    expect(body.directions_options.language).toBe('fr');
  });

  it('per-call locale overrides the client default', async () => {
    const fetchImpl = mockFetch();
    const client = new RoutingClient({ baseUrl: 'https://example.test', fetch: fetchImpl, locale: 'fr' });
    await client.route([{ lat: 30, lon: 31 }, { lat: 31, lon: 32 }], { locale: 'ar-EG' });
    const call = (fetchImpl as unknown as jest.Mock).mock.calls[0];
    expect(String(call[0])).toContain('locale=ar-EG');
    expect(call[1].headers['Accept-Language']).toBe('ar-EG');
    const body = JSON.parse(call[1].body);
    expect(body.directions_options.language).toBe('ar-EG');
  });

  it('apiKey flows into X-API-Key header', async () => {
    const fetchImpl = mockFetch();
    const client = new RoutingClient({ baseUrl: 'https://example.test', fetch: fetchImpl, apiKey: 'demo' });
    await client.route([{ lat: 30, lon: 31 }, { lat: 31, lon: 32 }]);
    const call = (fetchImpl as unknown as jest.Mock).mock.calls[0];
    expect(call[1].headers['X-API-Key']).toBe('demo');
  });

  it('matrix hits /sources_to_targets', async () => {
    const fetchImpl = mockFetch({});
    const client = new RoutingClient({ baseUrl: 'https://example.test', fetch: fetchImpl });
    await client.matrix([{ lat: 30, lon: 31 }], [{ lat: 31, lon: 32 }]);
    expect(String((fetchImpl as unknown as jest.Mock).mock.calls[0][0])).toContain('https://example.test/sources_to_targets');
  });

  it('isochrone hits /isochrone with contours', async () => {
    const fetchImpl = mockFetch({});
    const client = new RoutingClient({ baseUrl: 'https://example.test', fetch: fetchImpl });
    await client.isochrone({ lat: 30, lon: 31 }, { contours: [{ time: 5 }] });
    const body = JSON.parse((fetchImpl as unknown as jest.Mock).mock.calls[0][1].body);
    expect(body.contours).toEqual([{ time: 5 }]);
  });

  it('elevation is an alias for /height', async () => {
    const fetchImpl = mockFetch({});
    const client = new RoutingClient({ baseUrl: 'https://example.test', fetch: fetchImpl });
    await client.elevation([{ lat: 30, lon: 31 }]);
    expect(String((fetchImpl as unknown as jest.Mock).mock.calls[0][0])).toContain('https://example.test/height');
  });

  it('mapMatch hits /trace_route', async () => {
    const fetchImpl = mockFetch();
    const client = new RoutingClient({ baseUrl: 'https://example.test', fetch: fetchImpl });
    await client.mapMatch([{ lat: 30, lon: 31 }, { lat: 31, lon: 32 }]);
    const body = JSON.parse((fetchImpl as unknown as jest.Mock).mock.calls[0][1].body);
    expect(body.shape_match).toBe('map_snap');
  });

  it('wraps non-2xx in RoutingError', async () => {
    const fetchImpl = jest.fn(async () => new Response('boom', { status: 502 })) as unknown as typeof fetch;
    const client = new RoutingClient({ baseUrl: 'https://example.test', fetch: fetchImpl });
    await expect(client.route([{ lat: 30, lon: 31 }, { lat: 31, lon: 32 }])).rejects.toBeInstanceOf(RoutingError);
  });
});

describe('decodePolyline', () => {
  it('decodes the canonical fixture', () => {
    expect(decodePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@')).toHaveLength(3);
  });
});
