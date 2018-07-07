#!/usr/bin/env python3.6

# inspired from https://websockets.readthedocs.io/en/stable/intro.html
# WS server example

import asyncio
import json
import logging
import websockets
import time
import numpy as np

from constants import *
from gameobjects import *

# enable logging

logging.basicConfig(level=logging.DEBUG)

# game state

players = {}
boxes = {}
ball = Ball(0)
next_gameobject_id = 1

## message building

def message_object_new(gameobject):
	message = gameobject.get_json_state(True)
	message['type'] = 'object_new'
	return json.dumps(message)

def message_object_status(gameobject):
	message = gameobject.get_json_state(False)
	message['type'] = 'object_state'
	return json.dumps(message)

def message_object_part(gameobject):
	return json.dumps({'type': 'object_part', 'id': gameobject.id})

def message_player_welcome(player):
	return json.dumps({'type': 'player_welcome', 'id': player.id})

## notification helper methods

async def notify_players(source_player, messager_builder_function):
	if players:       # asyncio.wait doesn't accept an empty list
		message = messager_builder_function(source_player)
		await asyncio.wait([websocket.send(message) for websocket in players])

## network processing callbacks

async def register(websocket):
	global next_gameobject_id
	# receive the name from this player
	name = await websocket.recv()
	# TODO: check for name duplications
	player = Player(name, next_gameobject_id)
	websocket.send(message_player_welcome(player))
	next_gameobject_id += 1
	# send the current state to this player
	await websocket.send(message_object_new(ball))
	for other_websocket, other_player in players.items():
		await websocket.send(message_object_new(other_player))
	# add to the list of players
	players[websocket] = player
	# tell all players about this new one
	await notify_players(player, message_object_new)
	# print and return
	print(f"> {name} connected")
	return player

async def unregister(websocket):
	# remove from the list of players
	player = players[websocket]
	del players[websocket]
	# tell others players about this disconnection
	await notify_players(player, message_object_part)
	print(f"> {player.name} disconnected")

## client processing code

async def process_client(websocket, path):
	# register(websocket) sends user_event() to websocket
	player = await register(websocket)
	try:
		# process messages from this player
		async for message in websocket:
			data = json.loads(message)
			if data['action'] == 'move':
				# set the speed of the player
				player.move(data['speed'], 0.1)
				await notify_players(player, message_object_status)
			elif data['action'] == 'weapon_trigger':
				cur_time = time.time()
				if cur_time - player.last_fire_time < TIME_BETWEEN_FIRE:
					# we are not allowed to fire
					continue
				# see if any other player has been hit
				did_hit = False
				for other_websocket, other_player in players.items():
					if other_player == player:
						continue
					# if we hit the other
					if np.linalg.norm(other_player.pos - player.pos) < DIST_TO_HIT:
						did_hit = True
						# increase our hits
						player.hits += 1
						# disable fire for other
						other_player.last_fire_time = cur_time
				# if we did hit, update the client
				if did_hit:
					await notify_players(player, message_object_status)
				player.last_fire_time = cur_time
			elif data['action'] == 'power_trigger':
				logging.info("Got power trigger, unimplemented yet")
			else:
				logging.error("unsupported event: {}", data)
	finally:
		await unregister(websocket)

## server-side state update

async def run_state():
	last_time = time.time()
	while True:
		cur_time = time.time()
		for websocket, player in players.items():
			#print (player.name)
			#print (player.pos)
			#print (player.speed)
			if player.step(cur_time - last_time):
				await notify_players(player, message_object_status)
		last_time = cur_time
		await asyncio.sleep(UPDATE_PERIOD)

## main code

loop = asyncio.get_event_loop()
loop.run_until_complete(websockets.serve(process_client, '', 6789))
loop.run_until_complete(run_state())
