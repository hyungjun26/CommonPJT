package ido.arduino.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import ido.arduino.dao.LocationMapper;
import ido.arduino.dto.LocationDto;

@Service
public class LocationServiceImpl implements LocationService{
	
	@Autowired
	LocationMapper locationMapper;

	@Override
	public LocationDto getLocationInfo(int locationID) {
		return locationMapper.getLocationInfo(locationID);
	}
	
}