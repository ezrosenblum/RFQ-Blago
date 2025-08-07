import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, NgZone, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';
import { GoogleMapsApi } from '../../../models/rfq.model';

declare var google: GoogleMapsApi;
@Component({
  selector: 'app-service-areas',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './service-areas.component.html',
  styleUrl: './service-areas.component.scss'
})
export class ServiceAreasComponent {
  @ViewChild('locationInput') locationInput!: ElementRef;
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @Output() serviceAreaChange = new EventEmitter<{
    streetAddress: string;
    latitude: number;
    longitude: number;
    radius: number;
  }>();

  selectedLocation: string = '';
  rangeMiles: number = 10;
  
  private map: any;
  private autocomplete: any;
  private marker: any;
  private circle: any;
  selectedPlaceDetails: any = null;

  StreetAddress: string = '';
  LatitudeAddress: number = 0;
  LongitudeAddress: number = 0;
  OperatingRadius: number = 0;

  constructor(private ngZone: NgZone) {}


  ngAfterViewInit() {
   this.loadGoogleMaps();
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
    const defaultLocation = { lat: 41.9981, lng: 21.4254 }; // Skopje, Macedonia

    this.map = new google.maps.Map(this.mapContainer.nativeElement, {
      center: defaultLocation,
      zoom: 12,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        {
          featureType: "administrative.locality",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }]
        },
        {
          featureType: "poi",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }]
        },
        {
          featureType: "poi.park",
          elementType: "geometry",
          stylers: [{ color: "#263c3f" }]
        },
        {
          featureType: "poi.park",
          elementType: "labels.text.fill",
          stylers: [{ color: "#6b9a76" }]
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#38414e" }]
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ color: "#212a37" }]
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [{ color: "#9ca5b3" }]
        },
        {
          featureType: "road.highway",
          elementType: "geometry",
          stylers: [{ color: "#746855" }]
        },
        {
          featureType: "road.highway",
          elementType: "geometry.stroke",
          stylers: [{ color: "#1f2835" }]
        },
        {
          featureType: "road.highway",
          elementType: "labels.text.fill",
          stylers: [{ color: "#f3d19c" }]
        },
        {
          featureType: "transit",
          elementType: "geometry",
          stylers: [{ color: "#2f3948" }]
        },
        {
          featureType: "transit.station",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }]
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#17263c" }]
        },
        {
          featureType: "water",
          elementType: "labels.text.fill",
          stylers: [{ color: "#515c6d" }]
        },
        {
          featureType: "water",
          elementType: "labels.text.stroke",
          stylers: [{ color: "#17263c" }]
        }
      ]
    });

    this.autocomplete = new google.maps.places.Autocomplete(
      this.locationInput.nativeElement,
      {
        types: ['geocode'],
        fields: ['place_id', 'geometry', 'name', 'formatted_address', 'address_components']
      }
    );

    this.autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        this.onPlaceSelected();
      });
    });

    this.marker = new google.maps.Marker({
      map: this.map,
      position: defaultLocation
    });

    this.circle = new google.maps.Circle({
      map: this.map,
      center: defaultLocation,
      radius: this.rangeMiles * 1609.34,
      fillColor: '#3B82F6',
      fillOpacity: 0.1,
      strokeColor: '#3B82F6',
      strokeOpacity: 0.3,
      strokeWeight: 2
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
    this.circle.setRadius(this.rangeMiles * 1000);

    this.emitServiceAreaData();
  }

  onRangeChange() {
    if (this.circle && this.rangeMiles) {
      this.circle.setRadius(this.rangeMiles * 1609.34);

      let zoom = 12;
      if (this.rangeMiles <= 5) zoom = 14;
      else if (this.rangeMiles <= 15) zoom = 12;
      else if (this.rangeMiles <= 50) zoom = 10;
      else zoom = 8;
      
      this.map.setZoom(zoom);
    }
  }

  getCurrentLocation(): any {
    return this.selectedPlaceDetails;
  }

  getCurrentRange(): number {
    return this.rangeMiles;
  }

  getLocationCoordinates(): { lat: number, lng: number } | null {
    if (this.selectedPlaceDetails?.geometry?.location) {
      return {
        lat: this.selectedPlaceDetails.geometry.location.lat(),
        lng: this.selectedPlaceDetails.geometry.location.lng()
      };
    }
    return null;
  }

  emitServiceAreaData() {
    this.StreetAddress = this.selectedPlaceDetails.formatted_address;
    this.LatitudeAddress = this.selectedPlaceDetails.geometry.location.lat();
    this.LongitudeAddress = this.selectedPlaceDetails.geometry.location.lng();
    this.OperatingRadius = this.rangeMiles;

    this.serviceAreaChange.emit({
      streetAddress: this.StreetAddress,
      latitude: this.LatitudeAddress,
      longitude: this.LongitudeAddress,
      radius: this.OperatingRadius,
    });
  }
}
