import { TestBed } from '@angular/core/testing';

import { CompoundsService } from './compounds.service';

describe('CompoundsService', () => {
  let service: CompoundsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompoundsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
