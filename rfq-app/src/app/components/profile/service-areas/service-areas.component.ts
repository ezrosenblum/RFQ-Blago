import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  NgZone,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';
import { GoogleMapsApi } from '../../../models/rfq.model';
import { User } from '../../../models/user.model';
import { Auth } from '../../../services/auth';

declare var google: GoogleMapsApi;
@Component({
  selector: 'app-service-areas',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './service-areas.component.html',
  styleUrl: './service-areas.component.scss',
})
export class ServiceAreasComponent implements OnInit {
  @ViewChild('locationInput') locationInput!: ElementRef;
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @Output() serviceAreaChange = new EventEmitter<{
    streetAddress: string;
    latitude: number;
    longitude: number;
    radius: number;
  }>();

  selectedLocation: string = '';
  rangeMiles: number = 0;

  private map: any;
  private autocomplete: any;
  private marker: any;
  private circle: any;
  selectedPlaceDetails: any = null;

  StreetAddress: string = '';
  LatitudeAddress: number = 0;
  LongitudeAddress: number = 0;
  OperatingRadius: number = 0;
  currentUser: User | null = null;
  isSubmitting: boolean = false;
  coordinatesChanged: boolean = false;

  constructor(private ngZone: NgZone, private _authService: Auth) {}

  ngOnInit(): void {
    this.loadGoogleMaps();
    this._authService.currentUserSubject.subscribe({
      next: (user) => {
        if (user) {
          this.currentUser = user;
        }
      },
    });
  }

  private loadGoogleMaps() {
    if (typeof google !== 'undefined') {
      this.initializeMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.initializeMap();
    };
    document.head.appendChild(script);
  }

  private initializeMap() {
    const address = this.currentUser?.companyDetails?.streetAddress || '';
    this.selectedLocation = address;
    this.rangeMiles = this.currentUser?.companyDetails?.operatingRadius || 10;
    const defaultLocation = {
      lat: this.currentUser?.companyDetails?.latitudeAddress || 41.9981,
      lng: this.currentUser?.companyDetails?.longitudeAddress || 21.4254,
    }; // Skopje, Macedonia

    this.map = new google.maps.Map(this.mapContainer.nativeElement, {
      center: defaultLocation,
      zoom: 10,
    });

    this.autocomplete = new google.maps.places.Autocomplete(
      this.locationInput.nativeElement,
      {
        types: ['geocode'],
        fields: [
          'place_id',
          'geometry',
          'name',
          'formatted_address',
          'address_components',
        ],
      }
    );

    this.autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        this.onPlaceSelected();
      });
    });

    this.marker = new google.maps.Marker({
      map: this.map,
      position: defaultLocation,
    });

    this.circle = new google.maps.Circle({
      map: this.map,
      center: defaultLocation,
      radius: this.rangeMiles * 1609.34,
      fillColor: '#3B82F6',
      fillOpacity: 0.1,
      strokeColor: '#3B82F6',
      strokeOpacity: 0.3,
      strokeWeight: 2,
    });
  }

  private onPlaceSelected() {
    const place = this.autocomplete.getPlace();

    if (!place.geometry || !place.geometry.location) {
      console.log('No location data available for this place');
      return;
    }

    this.selectedPlaceDetails = place;
    this.selectedLocation = place.formatted_address || place.name;

    const location = place.geometry.location;

    this.map.setCenter(location);
    this.map.setZoom(12);

    this.marker.setPosition(location);

    this.circle.setCenter(location);
    this.circle.setRadius(this.rangeMiles * 1609.34);

    this.emitServiceAreaData();
  }

  onRangeChange() {
    if (this.circle && this.rangeMiles) {
      const radiusInMeters = this.rangeMiles * 1609.34;
      this.circle.setRadius(radiusInMeters);
      const bounds = this.circle.getBounds();
      if (bounds) {
        this.map.fitBounds(bounds);
      }
    }
  }

  getCurrentLocation(): any {
    return this.selectedPlaceDetails;
  }

  getCurrentRange(): number {
    return this.rangeMiles;
  }

  getLocationCoordinates(): { lat: number; lng: number } | null {
    if (this.selectedPlaceDetails?.geometry?.location) {
      return {
        lat: this.selectedPlaceDetails.geometry.location.lat(),
        lng: this.selectedPlaceDetails.geometry.location.lng(),
      };
    }
    return null;
  }

  emitServiceAreaData() {
    this.StreetAddress = this.selectedPlaceDetails.formatted_address;
    this.LatitudeAddress = this.selectedPlaceDetails.geometry.location.lat();
    this.LongitudeAddress = this.selectedPlaceDetails.geometry.location.lng();
    this.OperatingRadius = this.rangeMiles;
    this.coordinatesChanged = true;

    this.serviceAreaChange.emit({
      streetAddress: this.StreetAddress,
      latitude: this.LatitudeAddress,
      longitude: this.LongitudeAddress,
      radius: this.OperatingRadius,
    });
  }
}
