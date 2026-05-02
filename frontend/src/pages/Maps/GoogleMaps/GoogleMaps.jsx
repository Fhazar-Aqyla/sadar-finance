import React, { useState } from 'react';
import { Container, Row, Col, Card, CardBody, CardHeader } from 'reactstrap';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

//Import Breadcrumb
import BreadCrumb from '../../../Components/Common/BreadCrumb';

const containerStyle = {
    width: '100%',
    height: '300px',
};

const center = { lat: 37.778519, lng: -122.40564 };
const second = { lat: 54.5260, lng: 15.2551 }
const third = { lat: 8.7832, lng: 34.5085 }
const fourth = { lat: 19.0760, lng: 72.8777 }


const GoogleMaps = (props) => {
    document.title="Google Maps | Velzon - React Admin & Dashboard Template";

    const selectedPlace = {}

    const [selected, setSelected] = useState(null);

    const onSelect = (marker) => {
        setSelected(marker);
    };

    return (
        <React.Fragment>                
                <div className="page-content">
                    <Container fluid>
                    <BreadCrumb title="Google Maps" pageTitle="Maps" />

                        <Row>
                            <Col lg={6}>
                                <Card>
                                    <CardHeader>
                                        <h4 className="card-title mb-0">Markers</h4>
                                    </CardHeader>
                                    <CardBody>
                                        <div id="gmaps-markers" className="gmaps" style={{ position: "relative" }}>
                                        <LoadScript googleMapsApiKey="AIzaSyAbvyBxmMbFhrzP9Z8moyYr6dCr-pzjhBE">
                                            <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={14}>
                                                <Marker position={center} onClick={() => onSelect(center)} />
                                                {selected && (
                                                    <InfoWindow
                                                        position={selected}
                                                        onCloseClick={() => setSelected(null)}
                                                    >
                                                        <div>
                                                            <h1>{selectedPlace.name}</h1>
                                                        </div>
                                                    </InfoWindow>
                                                )}
                                            </GoogleMap>
                                        </LoadScript>
                                            </div>
                                    </CardBody>
                                </Card>
                            </Col>
                            <Col lg={6}>
                                <Card>
                                    <CardHeader>
                                        <h4 className="card-title mb-0">Overlays</h4>
                                    </CardHeader>
                                    <CardBody >
                                        <div id="gmaps-overlay" className="gmaps" style={{ position: "relative" }}>
                                        <LoadScript googleMapsApiKey="AIzaSyAbvyBxmMbFhrzP9Z8moyYr6dCr-pzjhBE">
                                            <GoogleMap mapContainerStyle={containerStyle} center={second} zoom={14}>
                                                <Marker position={second} onClick={() => onSelect(second)} />
                                                {selected && (
                                                    <InfoWindow
                                                        position={selected}
                                                        onCloseClick={() => setSelected(null)}
                                                    >
                                                        <div>
                                                            <h1>{selectedPlace.name}</h1>
                                                        </div>
                                                    </InfoWindow>
                                                )}
                                            </GoogleMap>
                                        </LoadScript>
                                            </div>
                                    </CardBody>
                                </Card>
                            </Col>                            
                        </Row>                    

                        <Row>
                            <Col lg={6}>
                                <Card >
                                    <CardHeader>
                                        <h4 className="card-title mb-0">Street View Panoramas</h4>
                                    </CardHeader>
                                    <CardBody>
                                        <div id="panorama" className="gmaps-panaroma" style={{ position: "relative" }}>
                                        <LoadScript googleMapsApiKey="AIzaSyAbvyBxmMbFhrzP9Z8moyYr6dCr-pzjhBE">
                                            <GoogleMap mapContainerStyle={containerStyle} center={third} zoom={20}>
                                                <Marker position={third} onClick={() => onSelect(third)} />
                                                {selected && (
                                                    <InfoWindow
                                                        position={selected}
                                                        onCloseClick={() => setSelected(null)}
                                                    >
                                                        <div>
                                                            <h1>{selectedPlace.name}</h1>
                                                        </div>
                                                    </InfoWindow>
                                                )}
                                            </GoogleMap>
                                        </LoadScript>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>                           

                            <Col lg={6}>
                                <Card>
                                    <CardHeader>
                                        <h4 className="card-title mb-0">Map Types</h4>
                                    </CardHeader>

                                    <div className="card-body">
                                        <div id="gmaps-types" className="gmaps" style={{ position: "relative" }}>
                                        <LoadScript googleMapsApiKey="AIzaSyAbvyBxmMbFhrzP9Z8moyYr6dCr-pzjhBE">
                                            <GoogleMap mapContainerStyle={containerStyle} center={fourth} zoom={20}>
                                                <Marker position={fourth} onClick={() => onSelect(fourth)} />
                                                {selected && (
                                                    <InfoWindow
                                                        position={selected}
                                                        onCloseClick={() => setSelected(null)}
                                                    >
                                                        <div>
                                                            <h1>{selectedPlace.name}</h1>
                                                        </div>
                                                    </InfoWindow>
                                                )}
                                            </GoogleMap>
                                        </LoadScript>
                                        </div>
                                    </div>
                                </Card>
                            </Col>                            
                        </Row>                     
                    </Container>                    
                </div>
        </React.Fragment>
    );
}

export default GoogleMaps




