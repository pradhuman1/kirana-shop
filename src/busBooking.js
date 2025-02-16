/*

Product req.

-> avaliable Locations
-> For each location time slots
-> For each timeslot Service provider  []
-> Avaliablity for each service provider/time slot [no of seats vaccant]
-> Real time price for each service provider

-> Calander view  for highlight of the price
-> Booking Submit 



Payments intgration 
-> confirmation of booking


Notifcation service 
-> Campaigns
->Notify user for the upcomming trip

 -> email service 
 -> Sms
 ->WhatsApp




 -------Non function case
 -> Concurrency
 -> Performance
 -> Cache layer for read requests 

 ->Security 




 ---------------
 Business User [Service provider]
 -> 






 Schema Design

 Service Provider table 

[
{locationId:1232,locationName:Delhi,Providers:[idOfProviders],geoLocation:""}
{locationId:123,locationName:Jaipur,Providers:[idOfProviders]}
...
....

....
]


Approach A 

{providerId:9878t,SLots:[timeSlots{12pm,1pm,5pm,10pm,11pm}],LocationOfTheProvider:"Address",contactNumber:""}




----------


{timeSlotId:213124,busList:[1212423,7576], markUnavliable:false}


{busID:1212423
SEATINFO:[
{seatNo:"1",status:sold/avliable/inProgress}
{seatNo:"2",status:sold/avliable/inProgress}

]

}










 







*/
