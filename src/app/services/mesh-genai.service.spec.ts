import { TestBed } from '@angular/core/testing';

import { MeshGenaiService } from './mesh-genai.service';

describe('MeshGenaiService', () => {
  let service: MeshGenaiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MeshGenaiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
